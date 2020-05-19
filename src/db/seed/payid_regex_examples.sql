-- construct a table of valid and invalid PayIDs to test implementations against
drop table if exists payid_examples;
create table payid_examples (pay_id varchar(250) primary key, is_valid bool);

-- valid payids
insert into payid_examples values ('1$1.1.1.1', true);
insert into payid_examples values ('payid$example.com', true);
insert into payid_examples values ('firstname.lastname$example.com', true);
insert into payid_examples values ('payid$subexample.example.com', true);
insert into payid_examples values ('firstname+lastname$example.com', true);
insert into payid_examples values ('payid$123.123.123.123', true);
insert into payid_examples values ('1234567890$example.com', true);
insert into payid_examples values ('payid$example-one.com', true);
insert into payid_examples values ('_______$example.com', true);
insert into payid_examples values ('payid$example.name', true);
insert into payid_examples values ('payid$example.co.jp', true);
insert into payid_examples values ('firstname-lastname$example.com', true);
insert into payid_examples values ('payid@example.com$example.com', true);
insert into payid_examples values ('firstname.lastname@example.com$example.com', true);
insert into payid_examples values ('payid@subexample.example.com$example.com', true);
insert into payid_examples values ('firstname+lastname@example.com$example.com', true);
insert into payid_examples values ('payid@123.123.123.123$example.com', true);
insert into payid_examples values ('1234567890@example.com$example.com', true);
insert into payid_examples values ('payid@example-one.com$example.com', true);
insert into payid_examples values ('_______@example.com$example.com', true);
insert into payid_examples values ('payid@example.name$example.com', true);
insert into payid_examples values ('payid@example.co.jp$example.com', true);
insert into payid_examples values ('firstname-lastname@example.com$example.com', true);

-- invalid payids
insert into payid_examples values ('payid@[123.123.123.123]$example.com', false);
insert into payid_examples values ('payid$[123.123.123.123]', false);
insert into payid_examples values ('"payid"$example.com', false);
insert into payid_examples values ('#$%^%#$$#$$#.com', false);
insert into payid_examples values ('$example.com', false);
insert into payid_examples values ('Joe Smith <payid$example.com>', false);
insert into payid_examples values ('payid.example.com', false);
insert into payid_examples values ('payid$example$example.com', false);
insert into payid_examples values ('.payid$example.com', false);
insert into payid_examples values ('payid.$example.com', false);
insert into payid_examples values ('payid..payid$example.com', false);
insert into payid_examples values ('あいうえお$example.com', false);
insert into payid_examples values ('payid$example.com (Joe Smith)', false);
insert into payid_examples values ('payid$example', false);
insert into payid_examples values ('payid$-example.com', false);
insert into payid_examples values ('payid$111.222.333.44444', false);
insert into payid_examples values ('payid$example..com', false);
-- really invalid payids
insert into payid_examples values ('payid$example.com?garbage', false);
insert into payid_examples values ('payid$example.com/garbage', false);
insert into payid_examples values ('payid$example.com#garbage', false);
insert into payid_examples values ('payid$example.com&garbage', false);
insert into payid_examples values ('payid$example.com:garbage', false);
insert into payid_examples values ('payid$example.com\\garbage', false);
insert into payid_examples values ('payid$example.com/garbage?more=garbage&even=more#garbage', false);
insert into payid_examples values ('payid$example.com;', false);
insert into payid_examples values (E'payid$example.com\'', false);
insert into payid_examples values ('payid$example.com"', false);
insert into payid_examples values ('p$ayid$example.com?garbage', false);
