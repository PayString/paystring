# Deploy PayID on AWS

You can set up a PayID server on AWS (Amazon Web Services.

1. Initialize a `t2.micro` instance on AWS running Ubuntu 18.04m with a minimum of 8 GB SSD. For the purposes of this demo, you can use AWS Free Tier.
    See [Getting Started with Amazon EC2 Linux Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) for more information about setting up your instance.
2. Get an elastic IP address and associate it with your AWS `t2.micro` instance, as described in [Step 1, part 10](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html#ec2-launch-instance).
3. Update the DNS for your PayID domain as shown in the following table. Add any other subdomain you would like to use as a PayID as well.

  |Type|	Name | Value | TTL |
 | -----|-------- | ------|------- |
  |A	|@		| *your-ip-address* |	600 seconds |
  |A	| *your-payID-address*	| *your-ip-address* |1/2 Hour |

4. Set your instance's firewall/security group.
   * Port 80 (TCP) open for all address
   * Port 8081 (Private API access) open for your local IP address only, or closed generally, or only available inside your virtual private cloud. If port 8081 is exposed publicly it allows anybody to update your payment information, potentially leading to a loss of funds.
   * Port 22 (SSH) open
5. SSH into your instance.
   * Right-click on the instance.
   * Click **Connect**.
   * Copy the example command and run it in your local terminal. You must have local access to the private key file associated with your instance.
6. Install git on your instance.
   `sudo apt-get install git`
7. Link the git on your instance to your GitHub account, as described in [Connecting to GitHub with SSH](https://help.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh). Follow the instructions for [Generating a new SSH key and adding it to the ssh-agent](https://help.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).
8. Install docker on your instance.
   ```
   sudo apt-get update
   sudo apt install docker.io
   ```
9. Clone the payid Github repository.
   `git clone git@github.com:xpring-eng/payid.git`
10. Set the docker port to 80 by modifying the demo script.
    * Open the script editor: `nano payid/demo/run_payid_demo.sh`
    * Change the line:
      `docker run --name payid -d -p 8080:8080 -p 8081:8081 payid_demo:latest`
       to
      `docker run --name payid -d -p 80:8080 -p 8081:8081 payid_demo:latest`
11. Run the demo script:
    `sudo payid/demo/run_payid_demo.sh`
     You should see a success message like this one (note the port will be different due to changing it in step 10).
     "PayID is now available on localhost:8080 and localhost:8081".
     Stop the demo at any time by running 'docker stop -t 1 payid'.
12. Check your IP address and the website in your browser to confirm the server is running. You should see an error message like:
    `{"statusCode":400,"error":"Bad Request","message":"Invalid Accept header. Must be of the form \"application/xrpl-{environment}+json\""}`
13. Load up your desired PayID to the database using the [private PayID API](readme.md). If you use a subdomain rather than a path, then you must set up a DNS record for the subdomain as described in step 3.
    **Note:** You can add PayIDs for each (payment_pointer, network, environment) tuple. Use this cURL command to set up a PayID.
    ```
    curl --location --request POST 'http://127.0.0.1:8081/v1/users' \
    --header 'Content-Type: application/json' \
    --data-raw '{
     "payment_pointer": "$<your-payment-pointer>",
     "addresses": [{
       "payment_network": "XRPL",
       "environment": "MAINNET",
       "details": {
         "address": "<your-address"
       }
     }]
    }'
    ```
14. From your local computer, run a cURL command to fetch your PayID. You must convert the PayID into a URL as per the [Payment Pointers spec](https://paymentpointers.org/syntax-resolution/).
  ```
  curl --location --request GET 'http://pay.michael.zochow.ski/.well-known/pay' --header 'Accept: application/xrpl-mainnet+json'
  ```
  For other PayID API methods, see the [readme](readme.md).
  **Note:** Public APIs hit port 80 and private APIs hit port 8081 per the config in step 10. Make sure that 8081 is limited so that outsiders cannot modify your server’s database.
  For additional network formats, see the [readme](readme.md).

Next, set up NGINX Reverse Proxy + SSL.

# NGINX Reverse Proxy + SSL setup

1. Change the PayID server to run on port 8080 (default).
2. Set up a Server Block on NGINX for your domain, following [these instructions](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04).
3. Install Certbot, as follows.
   ```
   apt-get update
   apt-get install software-properties-common
   add-apt-repository ppa:certbot/certbot
   apt-get update
   apt-get install python-certbot-nginx
   ```
4. Generate a certificate (choose to redirect)
   `certbot --nginx`
5. Change the location parameter in the NGINX conf file to reverse proxy to the PayID server (running on port 8080):
   `try_files $uri $uri/ =404;`
    to:
    ```
    proxy_pass http://localhost:8080;
    proxy_set_header Host $http_host;
    ```
    **Note:** The second line is required to preserve the original URL, which is used to find the user.
    **Note:** You can expand your certificate to cover any subdomain used in a PayID using:
             `sudo certbot -d zochow.ski,pay.michael.zochow.ski,www.zochow.ski --expand`
6. Restart NGINX.
   `sudo systemctl restart nginx`
7. [Optional] Update the NGINX configuration that catches PayID headers and forwards them to the PayID server; otherwise, send these headers to the web server.
   ```
   sudo nano /etc/nginx/sites-available/<your-site>
   location / {
                proxy_set_header Host $http_host;

                if ($http_accept ~ "application/xrpl-*") {
                        proxy_pass http://localhost:8080;
                }

                try_files $uri $uri/ =404;
        }
    ```
