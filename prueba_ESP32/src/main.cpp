#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <SPI.h>
#include <SD.h>

bool configMode = false;
bool notReaded = false;
const char* ssid     = "Loreta";
const char* password = "123456789";

AsyncWebServer server(80);

String paginaHTML() {
  String html = R"rawliteral(
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>ESP32 Página Interactiva</title>
    <style>
      body { font-family: Arial; text-align: center; margin-top: 50px; }
      h1 { color: #333; }
      button {
        padding: 10px 20px;
        font-size: 18px;
        margin: 10px;
        border: none;
        border-radius: 5px;
        background: #3498db;
        color: white;
        cursor: pointer;
      }
      button:hover { background: #2980b9; }
      #contador { font-size: 24px; margin-top: 20px; }
    </style>
  </head>
  <body>
    <h1>Servidor Web ESP32</h1>
    <p>Ejemplo de funcionalidades dentro de la página</p>
    <button onclick="sumar()">Sumar</button>
    <button onclick="resetear()">Reset</button>
    <div id="contador">Contador: 0</div>

    <script>
      let contador = 0;
      function sumar() {
        contador++;
        document.getElementById("contador").innerHTML = "Contador: " + contador;
      }
      function resetear() {
        contador = 0;
        document.getElementById("contador").innerHTML = "Contador: " + contador;
      }
    </script>
  </body>
  </html>
  )rawliteral";
  return html;
}

void setupFilemanager(void) {
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SD, "/webUI/index.html", "text/html");
  });
}

void setup() {
    Serial.println("Setup: Entering Configuration Mode");
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ssid, password);

    IPAddress IP = WiFi.softAPIP();
    setupFilemanager();
    configMode = true;
    Serial.println(IP);

    notReaded = true;
    // digitalWrite(LED_PIN,HIGH);
    // Serial.println("Reader\n Waiting for Card");

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/html", paginaHTML());
});


  server.begin();
  Serial.println("Servidor HTTP iniciado");
}

void loop() {
  // server.handleClient();
}
