'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP


// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formatMovementsDate = function(date, locale){
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)))
  const daysPassed = calcDaysPassed(new Date(), date)

  if(daysPassed === 0) return 'Today'
  if(daysPassed === 1) return 'Yesterday'
  if(daysPassed <= 7) return `${daysPassed} days`

  // const day = `${date.getDate()}`.padStart(2, 0)
  // const month = `${date.getMonth() + 1}`.padStart(2, 0 )
  // const year = date.getFullYear()
  return new Intl.DateTimeFormat(locale).format(date)
} 

const formatCur = function(value, locale, currency){
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value)
}

const displayMovements = function(acc, sort = false){
  containerMovements.innerHTML = ''

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements
  movs.forEach(function(mov, i){
    const type = mov > 0 ? 'deposit': 'withdrawal'

    const date = new Date(acc.movementsDates[i])
    const displayDate = formatMovementsDate(date, acc.locale)
    const formattedMov = formatCur(mov, acc.locale, acc.currency)

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value"> ${formattedMov}</div>
    </div>
    `
    containerMovements.insertAdjacentHTML('afterbegin', html)
  })
}


const calcDisplayBalance = function (acc){
  const balance = acc.movements.reduce((acc, mov) => acc + mov, 0)
  acc.balance = balance
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency)
}


const calcDisplaySummary = function(acc){
  const incomes = acc.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0)
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency)

  const out = acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency)

  const interest = acc.movements.filter(mov => mov > 0).map(deposit => (deposit * acc.interestRate)/100).filter((int, i, arr) => int >= 1).reduce((acc, mov) => acc + mov, 0)

  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency)
}


const createUserName = function(accounts){
  accounts.forEach((account) => {
    account.username = account.owner.toLowerCase().split(' ').map(name => name[0]).join('')
  })
}

createUserName(accounts)
const updateUI = function(){
  displayMovements(currentAccount)
  calcDisplayBalance(currentAccount)
  calcDisplaySummary(currentAccount)
}

const startLogoutTimer = function(){
  const tick = function(){
    const min = String(Math.trunc(time / 60)).padStart(2, 0)
    const sec = String(time % 60).padStart(2, 0)
    labelTimer.textContent = `${min}:${sec}`

    if(time === 0){
      clearInterval(timer)
      labelWelcome.textContent = 'Log in to get started'
      containerApp.style.opacity = 0
    }
    time --
  }
  let time = 10
  tick()
  const timer = setInterval(tick, 1000)
  return timer
}

let currentAccount, timer

// currentAccount = account1
// updateUI(currentAccount)
// containerApp.style.opacity = 1


const now = new Date()


btnLogin.addEventListener('click', function (e){
  e.preventDefault()

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)
  // console.log(currentAccount)

  if(currentAccount?.pin === +inputLoginPin.value){
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`
    containerApp.style.opacity = 1

    const now = new Date()
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      // weekday: 'long'
    }
    
    // const locale = navigator.language
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now)

    // labelDate.textContent = now
    // const day = `${now.getDate()}`.padStart(2, 0)
    // const month = `${now.getMonth() + 1}`.padStart(2, 0 )
    // const year = now.getFullYear()
    // const hour = now.getHours()
    // const min = `${now.getMinutes()}`.padStart(2, 0)
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`

    inputLoginUsername.value = inputLoginPin.value = ''
    inputLoginPin.blur()

    if(timer) clearInterval(timer)
    timer = startLogoutTimer()
    updateUI(currentAccount)
  }
})

btnTransfer.addEventListener('click', function(e){
  e.preventDefault()
  const amount = +inputTransferAmount.value
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value)
  // console.log(amount, receiverAcc)

  inputTransferAmount.value = inputTransferTo.value = ''

  if(amount > 0 && receiverAcc && currentAccount.balance >= amount && receiverAcc?.username !== currentAccount.username){
    currentAccount.movements.push(-amount)
    receiverAcc.movements.push(amount)

    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAcc.movementsDates.push(new Date().toISOString())

    updateUI(currentAccount)

    clearInterval(timer)
    timer = startLogoutTimer()
  }
})

btnLoan.addEventListener('click', function(e){
  e.preventDefault()
  const amount = Math.floor(inputLoanAmount.value)

  if(amount > 0 && currentAccount.movements.some(mov => mov > amount * 0.1)){
    setTimeout(function(){
      currentAccount.movements.push(amount)
      currentAccount.movementsDates.push(new Date().toISOString())
  
      updateUI(currentAccount)
      clearInterval(timer)
      timer = startLogoutTimer()
    }, 2500)
  }
})

btnClose.addEventListener('click', function(e){
  e.preventDefault()

  if(inputCloseUsername.value === currentAccount.username && +inputClosePin.value === currentAccount.pin){
    const index = accounts.findIndex(acc => acc.username === currentAccount.username)
    // console.log(index)

    accounts.splice(index, 1)

    containerApp.style.opacity = 0

  }
  inputCloseUsername.value = inputClosePin.value = ''
})

let sorted = false
btnSort.addEventListener('click', function(e){
  e.preventDefault()
  displayMovements(currentAccount, !sorted)
  sorted = !sorted
})

labelBalance.addEventListener('click', function(){
  const movementsUI = Array.from(document.querySelectorAll('.movements__value'), el => Number(el.textContent.replace("R", '')))

})

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
 
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// const account = accounts.find(acc => acc.owner === 'Jessica Davis')
// console.log(account)

// for(const acc of accounts){
//   if(acc.owner === 'Jessica Davis')
//   console.log(acc)
// }

//flat()
// const overBalalnce = accounts.map(acc => acc.movements).flat().reduce((acc, mov) => acc + mov, 0)
// console.log(overBalalnce)

//flatMap() 
const overBalalnce = accounts.flatMap(acc => acc.movements).reduce((acc, mov) => acc + mov, 0)
// console.log(overBalalnce)


const bankDepositSum = accounts.flatMap(acc => acc.movements).filter(mov => mov > 0).reduce((sum, curr) => sum + curr , 0)

// console.log(bankDepositSum)

// const numDeposits1000 = accounts.flatMap(acc => acc.movements).filter(mov => mov >= 1000).length

// const numDeposits1000 = accounts.flatMap(acc => acc.movements).reduce((count, cur) => (cur >= 1000 ? count + 1: count), 0)
const numDeposits1000 = accounts.flatMap(acc => acc.movements).reduce((count, cur) => (cur >= 1000 ? ++count: count), 0)
// console.log(numDeposits1000)

//a++ increments in next iteration
// let a = 5
// console.log(a++)

const {deposits, withdrawals} = accounts.flatMap(acc => acc.movements).reduce((sums, cur) => {
  // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur)
  sums[cur > 0 ? 'deposits': 'withdrawals'] += cur
  return sums
}, {deposits: 0, withdrawals: 0})

// console.log(deposits, withdrawals)

//convert to title case
const convertTitleCase = function(title){
  const  capitalize = str => str[0].toUpperCase() + str.slice(1)
  const exceptions = ['a', 'an', 'the', 'but', 'or', 'on', 'in', 'with', 'and']

  const titleCase = title.toLowerCase().split(' ').map(word => exceptions.includes(word) ? word : word[0].toUpperCase() + word.slice(1)).join(' ')
  return capitalize(titleCase)
}

// console.log(convertTitleCase('this is a nice title'))
// console.log(convertTitleCase('this is a Long title but not too long'))
// console.log(convertTitleCase('and here is another title with an EXAMPLE'))

labelBalance.addEventListener('click', function(){
  document.querySelectorAll('.movements__row').forEach(function(row, i) {
    if(i % 2 === 0) row.style.backgroundColor = 'orangered'

    if(i % 3 === 0) row.style.backgroundColor = 'blue'
  })
})



///Lecture
// console.log(new Date(account1.movementsDates[0]))

// console.log(new Date(3 * 24 * 60 * 60 * 1000))

