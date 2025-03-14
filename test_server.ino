#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>

const char* ssid = "vivo T1 5G";
const char* password = "1234567890";

AsyncWebServer server(80);

void handleServo(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
    StaticJsonDocument<200> doc;

    // Convert raw data to a string before parsing
    char jsonBuffer[len + 1];
    memcpy(jsonBuffer, data, len);
    jsonBuffer[len] = '\0';  // Null-terminate the string

    Serial.print("Raw JSON: ");
    Serial.println(jsonBuffer);

    // Parse the JSON
    DeserializationError error = deserializeJson(doc, jsonBuffer);
    if (error) {
        Serial.println("JSON Parsing Failed!");

        // Create response with CORS header
        AsyncWebServerResponse *response = request->beginResponse(400, "text/plain", "Invalid JSON");
        response->addHeader("Access-Control-Allow-Origin", "*");
        request->send(response);
        return;
    }

    Serial.print("Received Servo Angles: ");
    for (JsonVariant value : doc.as<JsonArray>()) {
        Serial.print(value.as<int>());
        Serial.print(" ");
    }
    Serial.println();

    // Send response with CORS enabled
    AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", "Servo Angles Received");
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
}

void setup() {
    Serial.begin(115200);

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi Connected!");
    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());

    // Handle preflight OPTIONS request for /servo
    server.on("/servo", HTTP_OPTIONS, [](AsyncWebServerRequest *request) {
      AsyncWebServerResponse *response = request->beginResponse(200);
      response->addHeader("Access-Control-Allow-Origin", "*");
      response->addHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      response->addHeader("Access-Control-Allow-Headers", "Content-Type");
      request->send(response);
    });

    // Handle POST requests to /servo
    server.on("/servo", HTTP_POST, 
        [](AsyncWebServerRequest *request){},
        NULL,
        [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
            handleServo(request, data, len, index, total);
        }
    );

    // Handle 404 (Not Found) errors with CORS support
    server.onNotFound([](AsyncWebServerRequest *request) {
        AsyncWebServerResponse *response = request->beginResponse(404, "text/plain", "Not Found");
        response->addHeader("Access-Control-Allow-Origin", "*");
        request->send(response);
    });

    server.begin();
}

void loop() {
    // Everything is handled asynchronously
}