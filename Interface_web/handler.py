#!/usr/bin/python
# -*- coding: utf-8 -*-

from flask import Flask, render_template
import pprint
import json
import os
import datetime

app = Flask(__name__) 

def createDictionary(value, date):
	dictionary = {}
	dictionary["value"] = value
	dictionary["date"] = date
	return dictionary

# When data is a global variable
def getData(typeOfData, time):
	dataDisplayed = []

	#json.dumps(): takes a json and convert it into a json string
	#json.loads(): takes a json string and convert it into a python dict
	j = json.loads(json.dumps(data))

	for item in j:
		# print item["measure"]
		if item["measure"] == typeOfData:
			if item["date"] < int(float(time)):
				# print "Data with measure of %s and time equals %d is retrieved" % (item["measure"], item["date"])
				dictionary = createDictionary(item["value"], item["date"])
				dataDisplayed.append(dictionary)
				# print dataDisplayed

	return json.dumps(dataDisplayed)

# From json with date as simple integer
# Warning: file date.json does not exit anymore
def getDataFromJsonFile(typeOfData, time):
	dataDisplayed = []
	dataTest = []

	# print "GET DATA FROM VARIABLE"
	# print "\njson.loads(json.dumps(data))\n"
	# pprint.pprint(json.loads(json.dumps(data)))

	# print "GET DATA FROM JSON FILE FUNCTION"

	with open(os.path.join('./static/files', 'data.json')) as data_file:
		for line in data_file:
			dataTest.append(json.loads(line))
			# print "dataTest"
			pprint.pprint(dataTest)

	for item in dataTest[0]:
		print item["measure"]
		if item["measure"] == typeOfData:
			if item["date"] < int(float(time)):
				# print "Data with measure of %s and time equals %d is retrieved" % (item["measure"], item["date"])
				dictionary = createDictionary(item["value"], item["date"])
				dataDisplayed.append(dictionary)
				# print dataDisplayed

	return json.dumps(dataDisplayed)

def parseDateTime(dateTimeStringFromJson):
	dateTimeCollection = []

	splittedDateTime = dateTimeStringFromJson.split("-")
	for i in range(len(splittedDateTime)-1):
		dateTimeCollection.append(splittedDateTime[i])

	splittedDate = splittedDateTime[len(splittedDateTime)-1].split(" ")
	for j in range(len(splittedDate)-1):
		dateTimeCollection.append(splittedDate[j])

	splittedTime = splittedDate[len(splittedDate)-1].split(":")
	for k in range(len(splittedTime)):
		dateTimeCollection.append(splittedTime[k])

	finalDateTime = datetime.datetime(int(float(dateTimeCollection[0])), int(float(dateTimeCollection[1])), int(float(dateTimeCollection[2])), int(float(dateTimeCollection[3])), int(float(dateTimeCollection[4])), int(float(dateTimeCollection[5])))

	return finalDateTime

def compareDateTimeValues(currentTime,timeMeasuredValue,timeToConsiderForDisplay):
	if timeMeasuredValue.date() == timeToConsiderForDisplay.date():
		if (timeMeasuredValue.time() > timeToConsiderForDisplay.time()) and (timeMeasuredValue.time() < currentTime.time()):
			return True
	else:
		return False

@app.route('/data/<typeOfData>/<time>')
def getDataWithCorrectDateFromJsonFile(typeOfData, time):

	now = datetime.datetime.today()

	dateTimeConsidered = now
	minuteFormatter = now.minute - int(float(time))
	if minuteFormatter < 0:
		hour = now.hour - 1
		minute = 60 - int(float(time))
		dateTimeConsidered = datetime.datetime(now.year, now.month, now.day, hour, minute, now.second)
	else:
		dateTimeConsidered = datetime.datetime(now.year, now.month, now.day, now.hour, minuteFormatter, now.second)

	dataDisplayed = []
	dataTest = []

	# print "GET DATA FROM VARIABLE"
	# print "\njson.loads(json.dumps(data))\n"
	# pprint.pprint(json.loads(json.dumps(data)))

	# print "GET DATA FROM JSON FILE FUNCTION\n"

	with open(os.path.join('./static/files', 'data-time.json')) as data_file:
		for line in data_file:
			# print "json.loads(line): \n"
			# pprint.pprint(json.loads(line))
			dataTest.append(json.loads(line))
			# print "dataTest"
			# pprint.pprint(dataTest)

	for item in dataTest[0]:
		print item["measure"]
		if item["measure"] == typeOfData:
			# print parseDateTime(item["date"])
			# print dateTimeConsidered
			if compareDateTimeValues(now, parseDateTime(item["date"]), dateTimeConsidered):
			#if item["date"] < int(float(time)):
				print "Data with measure of %s and time equals %s is retrieved" % (item["measure"], item["date"])
				dictionary = createDictionary(item["value"], item["date"])
				dataDisplayed.append(dictionary)
				print dataDisplayed

	return json.dumps(dataDisplayed)

@app.route('/')
def displayFirstGraphs():
	return render_template('index.html')
 
if __name__ == '__main__':
  app.run(debug=True)