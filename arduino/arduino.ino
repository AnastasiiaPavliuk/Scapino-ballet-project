#include <ArduinoJson.h>
#include <ArduinoJson.hpp>

#define led_1 8
#define led_2 9
#define buzzer 10

#define armTrigPin 2
#define armEchoPin 3

#define presenceTrigPin 4
#define presenceEchoPin 5

#define finishTrigPin A3
#define finishEchoPin 6

float armDistance, presenceDistance, finishDistance;
bool playerIs;
int minimalDistance = 13;

void setup() {
  Serial.begin(9600);

  pinMode(led_1, OUTPUT);
  pinMode(led_2, OUTPUT);
  pinMode(buzzer, OUTPUT);
  pinMode(armTrigPin, OUTPUT);
  pinMode(armEchoPin, INPUT);
  pinMode(presenceTrigPin, OUTPUT);
  pinMode(presenceEchoPin, INPUT);
  pinMode(finishTrigPin, OUTPUT);
  pinMode(finishEchoPin, INPUT);
}

void loop() {

  delay(50);

  armDistance = measureDistance(armTrigPin, armEchoPin);
  presenceDistance = measureDistance(presenceTrigPin, presenceEchoPin);
  finishDistance = measureDistance(finishTrigPin, finishEchoPin);

    DynamicJsonDocument doc(256);

      if (playerIs) {
      // DynamicJsonDocument doc(256);
      doc["armDistance"] = armDistance;
      doc["presenceDistance"] = presenceDistance;
      doc["finishDistance"] = finishDistance;
      doc["playerIs"] = playerIs;
      serializeJson(doc, Serial);
      Serial.println();

      digitalWrite(led_1, HIGH);
      digitalWrite(led_2, HIGH);
    } else {
      digitalWrite(led_1, LOW);
      digitalWrite(led_2, LOW);
    }

  if (Serial.available() > 0) {
    //read data
    String input = Serial.readStringUntil('\n');
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, input);
    if (error) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(error.c_str());
      return;
    }

    playerIs = doc["playerIs"];

    if (finishDistance < minimalDistance) {
      Serial.print("finishDistance: ");
      Serial.println(finishDistance);
      Serial.print("minimalDistance: ");
      Serial.println(minimalDistance);
      playerIs = false;
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

void checkFinishSensor() {

  Serial.print("finishDistance: ");
  Serial.println(finishDistance);

  if (finishDistance < minimalDistance) {
    playerIs = false;
  }
}

void handleDistance(float distance) {
  if (distance < 10) {
    digitalWrite(led_1, HIGH);
    digitalWrite(led_2, HIGH);
  } else {
    digitalWrite(led_1, LOW);
    digitalWrite(led_2, LOW);
  }

  if (distance < 3) {
    tooClose(distance);
  } else {
    noTone(buzzer);
  }
}

void tooClose(float distance) {
  tone(buzzer, 100);
}
