
#include <ArduinoJson.h>
#include <ArduinoJson.hpp>

#define led_yellow 8 //yellow
#define led_blue 7 //blue
#define SHOCK_PIN 9

// #define buzzer 10

#define armTrigPin 2
#define armEchoPin 3

#define presenceTrigPin 4
#define presenceEchoPin 5

#define finishTrigPin A3
#define finishEchoPin 6

float armDistance, presenceDistance, finishDistance;
bool playerIs = false;

int presenceDistanceNum = 70;
int armDistanceNum = 25;
int armDistanceMin = 12;
int armDistanceMax = 16;
int shockOutput;

void setup() {
  Serial.begin(9600);
  pinMode(SHOCK_PIN, INPUT);  
  pinMode(led_yellow, OUTPUT);
  pinMode(led_blue, OUTPUT);
  // pinMode(buzzer, OUTPUT);
  pinMode(armTrigPin, OUTPUT);
  pinMode(armEchoPin, INPUT);
  pinMode(presenceTrigPin, OUTPUT);
  pinMode(presenceEchoPin, INPUT);
  pinMode(finishTrigPin, OUTPUT);
  pinMode(finishEchoPin, INPUT);
}

void loop() {
  //delay(50);

  armDistance = measureDistance(armTrigPin, armEchoPin);
  presenceDistance = measureDistance(presenceTrigPin, presenceEchoPin);
  finishDistance = measureDistance(finishTrigPin, finishEchoPin);

  if (playerIs) {
    DynamicJsonDocument doc(256);
    doc["armDistance"] = armDistance;
    doc["presenceDistance"] = presenceDistance;
    doc["finishDistance"] = finishDistance;
    doc["shockOutput"] = digitalRead(SHOCK_PIN);
    serializeJson(doc, Serial);
    Serial.println();
  }

  if (Serial.available() > 0) {
    String s = Serial.readStringUntil('\n');
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, s);

    if (error) {
      logSerial("json parse failed");
      return;
    }

    if (doc.containsKey("playerIs")) {
      playerIs = doc["playerIs"].as<bool>();
    }
  }

  checkPlayerInTheFrame(presenceDistance, armDistance);
}

void checkPlayerInTheFrame(float presenceDistance, float armDistance) {
  //if distance less than 15
   if (presenceDistance < presenceDistanceNum || armDistance < armDistanceNum) {

    //if player is persize between 12 and 16
      if ((armDistance >= armDistanceMin )&&(armDistance <= armDistanceMax )){
      digitalWrite(led_yellow, LOW);
      digitalWrite(led_blue, HIGH);
    } 
    else {
      digitalWrite(led_blue, LOW);
      digitalWrite(led_yellow, HIGH);
    }
   } 
}

float measureDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  float duration = pulseIn(echoPin, HIGH);
  return (duration * 0.0343) / 2;  // Convert time to distance
}

void logSerial(const char* message) {
  DynamicJsonDocument doc(256);
  doc["type"] = "message";
  doc["value"] = message;
  serializeJson(doc, Serial);
  Serial.println();
}

// void tooClose(float distance) {
//   tone(buzzer, 100);
// }
