#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include <Adafruit_PWMServoDriver.h>
#include <ArduinoJson.h>

// ==== Wi-Fi config ====
const char* ssid     = "vivo T1 5G";
const char* password = "1234567890";

// ==== HTTP server ====
WebServer server(80);

// ==== PCA9685 servo driver ====
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

// Servo pulse parameters for PCA9685
#define SERVOMIN 150  // Min pulse length count
#define SERVOMAX 600  // Max pulse length count

int angleToPulse(int ang) {
  return map(ang, 0, 180, SERVOMIN, SERVOMAX);
}

// Servo sweep for ON (press ON then return to 0)
void servoOn(int channel) {
  for (int pos = 0; pos <= 90; pos += 2) {
    pwm.setPWM(channel, 0, angleToPulse(pos));
    delay(15);
  }
  delay(200);  // hold press
  // optional: disable pulses or move back as needed
}

// Servo sweep for OFF (press OFF then return to 0)
void servoOff(int channel) {
  for (int pos = 90; pos >= 0; pos -= 2) {
    pwm.setPWM(channel, 0, angleToPulse(pos));
    delay(15);
  }
  delay(200);  // hold press
  // optional: disable pulses or leave at 0
}

// CORS helper
void sendCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleOptions() {
  sendCORS();
  server.send(204); // No Content
}

void handleServoPost() {
  sendCORS();

  String body = server.arg("plain");
  DynamicJsonDocument doc(256);
  DeserializationError err = deserializeJson(doc, body);
  if (err) {
    server.send(400, "text/plain", "Bad JSON");
    return;
  }

  int sw = doc["switch"] | 0;  // expects 1..16
  int state = doc["state"] | -1; // expects 0 or 1

  if (sw < 1 || sw > 16 || (state != 0 && state != 1)) {
    server.send(400, "text/plain", "Invalid payload");
    return;
  }

  int channel = sw - 1; // PCA9685 is 0..15
  if (state == 1) {
    servoOn(channel);
  } else {
    servoOff(channel);
  }

  // Optionally stop PWM after action:
  // pwm.setPWM(channel, 0, 0);

  server.send(200, "text/plain", "OK");
}

void setup() {
  Serial.begin(115200);

  // --- PCA9685 init ---
  pwm.begin();
  pwm.setPWMFreq(60); // ~60 Hz typical for analog servos

  // --- Wi-Fi ---
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println();
  Serial.print("IP: "); Serial.println(WiFi.localIP());

  // --- HTTP routes ---
  server.on("/servo", HTTP_OPTIONS, handleOptions);
  server.on("/servo", HTTP_POST, handleServoPost);

  // Optional home route to sanity check server is up
  server.on("/", HTTP_GET, []() {
    sendCORS();
    server.send(200, "text/plain", "ESP32 servo server is running");
  });

  server.begin();
}

void loop() {
  server.handleClient();
}