def shuffleClass(pupilsList, noToBeMoved):
  # validate inputs first
  #check if pupils list is a valid list
  if not isinstance(pupilsList, list):
    return []
  #check if noToBeMoved is a valid integer
  if not isinstance(noToBeMoved, int):
    return pupilsList 
  classSize = len(pupilsList)
  #if pupils list contains just one element or noToBeMoved is zero return it
  if classSize <= 1 or noToBeMoved == 0:
    return pupilsList
  #check that the modulos of noToBeMoved and classSize is not zero if it is, return 
  if noToBeMoved >= classSize and abs(noToBeMoved) % classSize == 0:
    return pupilsList
  #no of steps irrespective of direction
  noOfSteps= abs(noToBeMoved) if abs(noToBeMoved) < classSize else abs(noToBeMoved) % classSize
  #set direction for movement
  endToFront = True if noToBeMoved > 0 else False

  if endToFront:#End to Front
    c=[pupilsList.pop() for x in range(noOfSteps)]
    d=[pupilsList.insert(0,x) for x in c]
    return pupilsList
  else:#FrontToEnd
    c=[pupilsList.pop(0) for x in range(noOfSteps)]
    d=[pupilsList.append(x) for x in c]
    return pupilsList
if __name__ == "__main__":
  print(shuffleClass([8,5,3,7], 2)) # return [3,7,8,5]
  print(shuffleClass([4,1,3], -1)) # return [1,3,4]
  print(shuffleClass([8,5,3,7,9,10], -106)) # return [9, 10, 8, 5, 3, 7]
  print(shuffleClass([4,1,3,7,20,90,14], -100)) # return [3, 7, 20, 90, 14, 4, 1]
    