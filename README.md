# SensorBoxClient #
*  Client Front end to show all widgets availables

## Installation
* `git clone git@github.com:ldubousq/SensorBoxClient.git `
*  Create your local virtual host to test application
``` 
  <VirtualHost *:80>
    DocumentRoot /var/www/
    <Directory />
        Options FollowSymLinks  
        AllowOverride None
    </Directory>
    <Directory /var/www/>
        Options Indexes FollowSymLinks MultiViews
        AllowOverride None
        Order allow,deny
        allow from all
    </Directory>
    ErrorLog ${APACHE_LOG_DIR}/error.log
    LogLevel warn
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```


## What's inside
* Simple web application with html, css, js
* package dependencies to install libraries like jquery and materialize framework

## Contribute
* develop on app folder to add new widget
* build on dist folder (execute `gulp`)
* commit your change with git
* deploy on Raspberry Pi on default location /var/www/sensorsV2 `scp -r dist/* pi@129.88.49.247:/var/www/sensorsv2/`
* 

> Written with [Romain Marecat](https://github.com/RomainMarecat).