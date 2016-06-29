#include "SocketIOClient.h"

SocketIOClient client;

byte mac[] = { 0xAA, 0x00, 0xBE, 0xEF, 0xFE, 0xEE };
char hostname[] = "10.7.0.177";
int port = 3000;
int gadgetID = 1;

bool loggedIn = false;
extern String RID;
extern String Rname;
extern String Rcontent;
unsigned long previousMillis = 0;
long interval = 10000;

bool tryConnection() {
  IPAddress myIP(10,7,0,100);
  
  Ethernet.begin(mac, myIP);

  Serial.println("Ethernet.begin(mac)");

  if (!client.connect(hostname, port)) {
    Serial.println("Not connected.");
    return false;
  }
  
  if (client.connected()) {
    Serial.println("connected, now do the client.send()");
    return true;
  } else {
    Serial.println("Connection Error");
    return false;
  }
}


void setup() {
  Serial.begin(9600);

  Serial.println("start setup");

  while(!tryConnection()) {
    Serial.println("connection not possible");
    delay(500);
  }

  Serial.println("Connection established!");
//  client.send("hello-world", "message", "Connected !!!!");
  
  delay(1000);
}

void loop()
{
  unsigned long currentMillis = millis();
  
  if(currentMillis - previousMillis > interval) {

    previousMillis = currentMillis;

    // uh oh! connection is gone...
    if (!client.connected()) {
      loggedIn = false;
      while(!tryConnection()) {
        Serial.println("connection not possible");
        delay(500);
      } 
    } else {
      // connection is here!
      if (!loggedIn) {
        Serial.println("do the login first");
        client.send("login", "id", (String) gadgetID);
      } else {
        client.send("hello-world", "message", "Hallo welt");
      } 
    }
    //client.heartbeat(0);
//    client.send("atime", "message", "Time please?");
  }
  
  if (client.monitor()) {

    if (RID == "access") {
      loggedIn = true;
    } else if (RID == "show") {
      Serial.println();
      Serial.println("monitor");
      Serial.print("RID: ");
      Serial.println(RID);
    } else {
      Serial.println();
      Serial.println("monitor");
      Serial.print("RID: ");
      Serial.println(RID);
      Serial.print("Rname: ");
      Serial.println(Rname);
      Serial.print("Rcontent: ");
      Serial.println(Rcontent);
    }
  }
}
