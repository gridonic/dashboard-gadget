//const int redPin = 11;
//const int greenPin = 10;
//const int bluePin = 9;
const int photoPinA = A15;     // the number of the pushbutton pin
int photoReadA = 1023;

int photoLimit = 20;
int loopIndex = 0;

void setup()
{
  Serial.begin(9600);      // open the serial port at 9600 bps:

  Serial.println("start the shit.");
//  pinMode(redPin, OUTPUT);
//  pinMode(greenPin, OUTPUT);
//  pinMode(bluePin, OUTPUT);
}

void loop()
{

  if (photoReadA < photoLimit) {
    Serial.println("PUSH THE BUTTON!");
//    setColor(50, 0, 0);
  } else {
//    setColor(255, 0, 0); // red
  }

//  delay(1000);
//  setColor(0, 255, 0); // green
//  Serial.println("green");
//  delay(1000);
//  setColor(0, 0, 255); // blue
//  Serial.println("blue");
//  delay(1000);
//  setColor(255, 255, 0); // yellow
//  Serial.println("yellow");
//  delay(1000);
//  setColor(80, 0, 80); // purple
//  Serial.println("purple");
//  delay(1000);
//  setColor(0, 255, 255); // aqua
//  Serial.println("aqua");
  delay(10);

  if (loopIndex % 50 == 0) {
    photoReadA = analogRead(photoPinA);
    Serial.print("photocell A: ");
    Serial.println(photoReadA);
  }

  loopIndex++;
}
//
//void setColor(int red, int green, int blue)
//{
//
//    red = 255 - red;
//    green = 255 - green;
//    blue = 255 - blue;
//
//    analogWrite(redPin, red);
////    analogWrite(greenPin, green);
////    analogWrite(bluePin, blue);
//}
