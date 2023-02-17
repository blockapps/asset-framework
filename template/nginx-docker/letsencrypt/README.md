# Letsencrypt certs

The tool automates the process of obtaining the real SSL certificate using certbot and letsencrypt to use for running application on https:// for production.
Certs are valid for 3 months and should be auto-updated. 
The alert emails are sent by letsencrypt to the email address provided in step (1) if the cert auto-renewal failed or was not executed.

To run the Application we need the first (initial) certificate to provide it to the container. 
After that, when the Application is already running, the certificate will be automatically renewed (see "Setup auto-renewal")


###### Obtain first cert

```
cd letsencrypt
HOST_NAME=mydnsname.example.com ADMIN_EMAIL=admin@example.com ./get-first-cert.sh
```
(provide the real email as it will be used by letsencrypt to send notifications if auto-renewal wasn't successful)
Add the `DRY_RUN=true` var if running for test/debugging (certbot has rate limit of 5 certs/week/host in non-dry-run mode)

In case of the successful non-dry run - follow the commands provided in the terminal final output


###### Setup auto-renewal

Setup the crontab job to renew the cert automatically every 2 months (cert is valid for 3 months)
```
sudo crontab -e
```
add line like this:
```
# replace PATH/TO parts (2 times):
3 5 1 */2 * (PATH=${PATH}:/usr/local/bin && cd /ABSOLUTE/PATH/TO/<dir>/nginx-docker/letsencrypt && HOST_NAME=myhost.example.com STRATOGS_DIR_PATH=../../../strato-getting-started ./renew-ssl-cert.sh >> /ABSOLUTE/PATH/TO/letsencrypt.log 2>&1)
```
(meaning this command will run every 2 months on 1st day of month at 5:03am UTC)

*NOTE:* Both scripts (get-first-cert.sh and renew-ssl-cert.sh) accept the `DRY_RUN=true` env var to make the test requests (real requests are limited to 5 requests/week/host by letsencrypt)
