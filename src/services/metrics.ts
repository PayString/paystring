import { hostname } from 'os'

import { Counter, Gauge, Pushgateway, Registry } from 'prom-client'

import config from '../config'
import getPayIdCounts from '../data-access/reports'
import logger from '../utils/logger'

/**
 * A singleton class that holds various metrics related state and functionality.
 *
 * Used to create a metrics object that can start recurring metrics generation,
 * send metrics to Prometheus, generate metrics for the /metrics endpoint,
 * and shut down the recurring metrics Timeouts.
 */
class Metrics {
  // Custom Prometheus registries.
  // The default registry gets used for other metrics that we don't want to collect from partners, like memory usage.
  //
  // We need separate registries so the gauge metrics need to be reported under a common org grouping,
  // so that they are treated as an absolute value. Counter metrics need to be reported under a specific instance
  // name so multiple counters get added up. (In scenarios where you are running multiple PayID servers).
  private readonly payIdLookupCounterRegistry: Registry
  private readonly payIdGaugeRegistry: Registry

  /** Prometheus Counter reporting the number of PayID lookups. */
  private readonly payIdLookupCounter: Counter<
    'paymentNetwork' | 'environment' | 'org' | 'result'
  >

  /** Prometheus Gauge for reporting the current count of PayIDs by [network, environment, org]. */
  private readonly payIdGauge: Gauge<'paymentNetwork' | 'environment' | 'org'>

  // These are Timeouts for generating metrics on a recurring basis.
  // To shut down the app properly, we need to clean these up as we shut down.
  private recurringMetricsPushTimeout?: NodeJS.Timeout
  private recurringMetricsTimeout?: NodeJS.Timeout

  // TODO:(hbergren) Should config be a parameter here?
  public constructor() {
    this.payIdLookupCounterRegistry = new Registry()
    this.payIdGaugeRegistry = new Registry()

    this.payIdLookupCounter = new Counter({
      name: 'payid_lookup_request',
      help: 'count of requests to lookup a PayID',
      labelNames: ['paymentNetwork', 'environment', 'org', 'result'],
      registers: [this.payIdLookupCounterRegistry],
    })

    this.payIdGauge = new Gauge({
      name: 'payid_count',
      help: 'count of total PayIDs',
      labelNames: ['paymentNetwork', 'environment', 'org'],
      registers: [this.payIdGaugeRegistry],
    })
  }

  /**
   * Tells you whether metrics are currently running.
   *
   * @returns A boolean indicating whether metrics are currently running.
   */
  public areMetricsRunning(): boolean {
    return (
      Boolean(this.recurringMetricsPushTimeout) &&
      Boolean(this.recurringMetricsTimeout)
    )
  }

  /**
   * Attempt to schedule a recurring metrics push to the metrics gateway URL.
   * Configured through the environment/defaults set in the PayID app config.
   */
  public scheduleRecurringMetricsPush(): void {
    if (!config.metrics.pushMetrics) {
      return
    }

    const payIdLookupCounterGateway = new Pushgateway(
      config.metrics.gatewayUrl,
      [],
      this.payIdLookupCounterRegistry,
    )

    const payIdGaugeGateway = new Pushgateway(
      config.metrics.gatewayUrl,
      [],
      this.payIdGaugeRegistry,
    )

    this.recurringMetricsPushTimeout = setInterval(() => {
      // Use 'pushAdd' because counts are additive. You want all values over time from multiple servers.
      // You don’t want the lookup count on one server to overwrite the running totals.
      payIdLookupCounterGateway.pushAdd(
        {
          jobName: 'payid_counter_metrics',
          groupings: {
            instance: `${config.metrics.domain as string}_${hostname()}_${
              process.pid
            }`,
          },
        },
        (err, _resp, _body): void => {
          if (err) {
            logger.warn('counter metrics push failed with ', err)
          }
        },
      )

      // Use push because we want the value to overwrite (only care about the current PayID count)
      payIdGaugeGateway.push(
        {
          jobName: 'payid_gauge_metrics',
          groupings: {
            instance: config.metrics.domain as string,
          },
        },
        (err, _resp, _body): void => {
          if (err) {
            logger.warn('gauge metrics push failed with ', err)
          }
        },
      )
    }, config.metrics.pushIntervalInSeconds * 1000)
  }

  /**
   * Set a recurring timer that will generate PayID count metrics every PAYID_COUNT_REFRESH_INTERVAL seconds.
   */
  public scheduleRecurringPayIdCountMetrics(): void {
    const refreshIntervalInSeconds =
      config.metrics.payIdCountRefreshIntervalInSeconds

    // Generate the metrics immediately so we don't wait for the interval
    this.generatePayIdCountMetrics().catch((err) =>
      logger.warn('Failed to generate initial PayID count metrics', err),
    )

    this.recurringMetricsTimeout = setInterval(() => {
      this.generatePayIdCountMetrics().catch((err) =>
        logger.warn('Failed to generate scheduled PayID count metrics', err),
      )
    }, refreshIntervalInSeconds * 1000)
  }

  /**
   * Cleans up the Timeouts we use to generate metrics on a recurring schedule.
   */
  public stopMetricsGeneration(): void {
    if (this.recurringMetricsTimeout?.hasRef()) {
      clearInterval(this.recurringMetricsTimeout.ref())
    }

    if (this.recurringMetricsPushTimeout?.hasRef()) {
      clearInterval(this.recurringMetricsPushTimeout.ref())
    }
  }

  /**
   * Increment a Prometheus Counter for every PayID lookup (public API).
   *
   * Segregated by whether the lookup was successful or not, and [paymentNetwork, environment].
   *
   * @param found - Whether the PayID lookup was successful or not.
   * @param paymentNetwork - The payment network of the lookup.
   * @param environment - The environment of the lookup.
   */
  public recordPayIdLookupResult(
    found: boolean,
    paymentNetwork: string,
    environment = 'null',
  ): void {
    this.payIdLookupCounter.inc(
      {
        paymentNetwork,
        environment,
        org: config.metrics.domain,
        result: found ? 'found' : 'not_found',
      },
      1,
    )
  }

  /**
   * Record a PayID lookup that failed due to a bad accept header.
   */
  public recordPayIdLookupBadAcceptHeader(): void {
    // TODO:(hbergren) Would we ever want to record the bad accept header here?
    this.payIdLookupCounter.inc(
      {
        paymentNetwork: 'unknown',
        environment: 'unknown',
        org: config.metrics.domain,
        result: 'error: bad_accept_header',
      },
      1,
    )
  }

  /**
   * Get PayID metrics from the registry.
   *
   * @returns A string representation of metrics.
   */
  public getMetrics(): string {
    return (
      this.payIdLookupCounterRegistry.metrics() +
      this.payIdGaugeRegistry.metrics()
    )
  }

  /** Generates the number of PayIDs grouped by [paymentNetwork, environment]. */
  public async generatePayIdCountMetrics(): Promise<void> {
    const payIdCounts = await getPayIdCounts()

    // Set the PayID count for a given [paymentNetwork, environment] tuple.
    payIdCounts.forEach((payIdCount) => {
      this.payIdGauge.set(
        {
          paymentNetwork: payIdCount.paymentNetwork,
          environment: payIdCount.environment,
          org: config.metrics.domain,
        },
        payIdCount.count,
      )
    })
  }
}

const metrics = new Metrics()

export default metrics

/**
 * Checks our metrics configuration to make sure that we are good to go.
 *
 * If metrics cannot be generated, or if push metrics are enabled and metrics could not be pushed,
 * we throw an error.
 *
 * @param metricsConfig - A configuration object controlling how metrics are pushed and generated.
 *
 * @throws An error if pushing metrics is enabled, but the required configuration to push metrics is missing or malformed.
 */
export function checkMetricsConfiguration(
  metricsConfig: typeof config.metrics,
): void {
  const oneDayInSeconds = 86_400

  if (
    metricsConfig.payIdCountRefreshIntervalInSeconds <= 0 ||
    metricsConfig.payIdCountRefreshIntervalInSeconds >= oneDayInSeconds
  ) {
    throw new Error(
      `Invalid PAYID_COUNT_REFRESH_INTERVAL value: "${metricsConfig.payIdCountRefreshIntervalInSeconds}". Must be a positive number less than 86400 seconds. PayID count metrics will not be generated.`,
    )
  }

  // All config tested after this has to do with pushing metrics
  if (!metricsConfig.pushMetrics) {
    return
  }

  try {
    // eslint-disable-next-line no-new -- We are using Node's URL library to see if the URL is valid.
    new URL(metricsConfig.gatewayUrl)
  } catch {
    throw new Error(
      `Push metrics are enabled, but the environment variable PUSH_GATEWAY_URL is not a valid url: "${metricsConfig.gatewayUrl}".`,
    )
  }

  if (metricsConfig.domain === '') {
    throw new Error(
      `
      Push metrics are enabled, but the environment variable PAYID_DOMAIN is an invalid value (empty string).
      Please set PAYID_DOMAIN to the domain your PayID server is running on, like "example.com",
      or you can disable pushing metrics by setting PUSH_PAYID_METRICS to false.

      Metrics only capture the total number of PayIDs by (paymentNetwork, environment),
      and the (paymentNetwork, environment) of requests to the PayID server.
      No identifying information is captured.
      `,
    )
  }

  if (
    metricsConfig.pushIntervalInSeconds <= 0 ||
    metricsConfig.pushIntervalInSeconds > oneDayInSeconds
  ) {
    throw new Error(
      `Push metrics are enabled, but the environment variable PUSH_METRICS_INTERVAL has an invalid value: "${metricsConfig.pushIntervalInSeconds}". Must be positive and less than one day in seconds.`,
    )
  }
}
