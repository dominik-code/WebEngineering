# WebEngineering

## Gruppenmitglieder:

* Alexander Bierenstiel
* Dominik Schmitt
* Timo Rautenberg

## Installation und Tests

* Alle Abhängigkeiten sind in der `package.json` enthalten. (`npm install` im Hauptverzeichnis um diese zu installieren)
* Der Server soll mit dem Befehl `node index.js` gestartet werden.
* Die Funktionalität wurde mit `Postman` getestet. Es befindet sich eine Kollektion der Testfunktionen im Repositoryverzeichnis mit dem Namen `Webeng Tests.postman_collection.json`

## Funktionale Anforderungen

* Im Header muss der JSONWebToken mitgegeben werden. Der Token wird im Feld: `x-access-token` erwartet.
* Parameternamen sind in `markdown` angegeben.
* Es wurden alle Routen für den User und den Blog implementiert. Alle Abfragen geben einen HTTP Statuscode zurück (200/401). Die API ist unter **`localhost:3000/api/V1/...`** erreichbar.

***
 1. User
    * `/login` (PUT)
    
      **Parameter:** `username`, `password`
      
      **Antwort:** JSON Keys: `success`, `message`, `token`
        
    * `/passwordRecovery` (PUT)
    
      **Parameter:** `jwt` (im Header), `oldpassword`, `newpassword`
      
      **Antwort:** JSON Keys: `token`
***
 2. Blog
    * `/blog/` (GET) alias Alle Blogbeiträge anzeigen
        
      **Parameter:** `jwt` (im Header, optional)
      
      **Antwort:** JSON: Mit allen Blogeinträgen (ohne jwt keine hidden)
    * `/blog/:id` (GET) alias Einen Blogbeitrag anzeigen
        
      **Parameter:** `jwt` (im Header, optional)
      
      **Antwort:** JSON: Blogeintrag (jwt erlaubt Zugriff auf alle, ohne nur hidden == false)
    * `/blog/:id` (DELETE) alias Einen Blogbeitrag löschen
        
      **Parameter:** `jwt` (im Header, optional)
      
      **Antwort:** JSON: message, HTTP Code 200 bzw. 401
    * `/blog/:id` (PUT) alias Einen Blogeintrag bearbeiten
        
      **Parameter:** `jwt` (im Header, optional), `gewünschte Parameter` (alle anderen bleiben unverändert)
      
      **Antwort:** JSON Object des Eintrag, HTTP Code 200 bzw. 401
    * `/blog/` (POST) alias Einen Blogbeitrag erstellen
        
      **Parameter:** `jwt` (im Header), `alle Parameter` (ohne \_id und index)
      
      **Antwort:** JSON ´id´ des Eintrags
