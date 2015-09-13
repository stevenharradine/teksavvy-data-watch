# Teksavvy Data Watch
reads your data usage from TekSavvy API and will activate hooks to do stuff based usage your current usage (like email you or disable services)

## clone repo
```
git clone https://github.com/stevenharradine/teksavvy-data-watch.git
```

## install npm packages
```
npm install
```

## update config.js
Update the config file with your API key from [TekSavvy](https://myaccount.teksavvy.com/ApiKey/ApiKeyManagement) and specify your usage cap in GB.
```
module.exports.API_KEY        = "<< YOURKEY >>";
module.exports.DATA_CAP       = "400";
```

## Usage
```
node teksavvy-data-watch
```
