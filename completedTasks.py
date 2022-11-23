import datetime
import random

now = datetime.datetime.now()

if now.hour < 13:
    print('Good morning Bunnys!\n')
else:
    if now.hour > 13 and now.hour <= 18:
        print('Good afternoon Bunnys!\n')
    else:
        if now.hour > 18:
            print('Good evening/night Bunnys!\n')

numberOfGoals = int(input('How many tasks did you finish today Bunnys? '))

i = 0

outputsList = ['I\'m so proud of you!', 'Good job!', 'Must feel amazing having completed that :D',
               'You must be so proud of yourself, you know I am!', 'Keep it up!', 'Ayyy let\'s go', 'Niceeeeeeeee', 'Amazing job Bunny!']

while (i < numberOfGoals):
    iterationGoal = input(f'What was task {i + 1}? ')

    print(random.choice(outputsList) + '\n')
    i = i + 1


nextDayHr = (datetime.datetime.today() + datetime.timedelta(days=1)).hour
nextDayYr = (datetime.datetime.today() + datetime.timedelta(days=1)).year
nextDayMn = (datetime.datetime.today() + datetime.timedelta(days=1)).month

whatElse = input(f'So what do you want to do on {nextDayYr}/{nextDayMn}/{nextDayHr}? ')
