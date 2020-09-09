import RPi.GPIO as GPIO
from time import sleep

pin1 = 40

GPIO.setmode(GPIO.BOARD)
GPIO.setup(pin1, GPIO.OUT)

GPIO.output(pin1, True)
sleep(.25)
GPIO.output(pin1, False)
sleep(.25)
GPIO.output(pin1, True)
sleep(.25)

GPIO.cleanup()
