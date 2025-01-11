'use strict';
//test
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Benjamin Exton',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2025-01-01T09:15:04.904Z',
    '2025-01-02T10:17:24.185Z',
    '2025-01-03T14:11:59.604Z',
    '2025-01-05T17:01:17.194Z',
    '2025-01-09T23:36:17.929Z',
    '2025-01-11T10:51:36.790Z',
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
    '2025-01-02T14:18:46.235Z',
    '2025-01-04T16:33:06.386Z',
    '2025-01-06T14:43:26.374Z',
    '2025-01-08T18:49:59.371Z',
    '2025-01-11T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
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

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
createUserName(accounts);
login();
transferMoneyButton();
deleteAccountButton();
requestLoanButton();
buttonSort();
setTodayDate();

//------------------------------------------------------------------
let activeAccount;
let flag = false;
let intervalTimer;
let time;

//MOVEMENTS
//DISPLAY ALL MOVEMENTS DEPENDING ON ACCOUNT
function displayCurrentAccountData(activeAccount) {
  displayMovements(activeAccount);
  calcMovementsBalance(activeAccount);
  displayMovementsHTML(activeAccount);
  welcome(activeAccount);

  flag = false;
}

//Display deposit/withdrawal Movements
function displayMovements(account, mov = false) {
  containerMovements.innerHTML = '';

  const sortedArr = createActiveMovementsAndDateObject(account);

  sortMovementsDates(mov, sortedArr);

  sortedArr.forEach((element, i) => {
    const { movement, datez } = element;

    const depositType = findDepositType(movement);

    const displayDate = createDates(datez);

    const appendMovement = createMovementELements(
      movement,
      i,
      depositType,
      displayDate
    );

    containerMovements.insertAdjacentHTML('afterbegin', appendMovement);
  });
}

function formattedCurrency(movement) {
  return new Intl.NumberFormat(activeAccount.locale, {
    style: 'currency',
    currency: 'AUD',
  }).format(movement);
}

function createActiveMovementsAndDateObject(account) {
  return account.movements.map((mov, i) => ({
    movement: mov,
    datez: activeAccount.movementsDates.at(i),
  }));
}

function sortMovementsDates(mov, sortedArr) {
  if (mov) {
    sortedArr.sort((a, b) => {
      return a.movement - b.movement;
    });
  }
}

// create deposit/withdrawl content html
function createMovementELements(movement, i, depositType, displayDate) {
  const formattedMov = formattedCurrency(movement);

  const html = ` <div class="movements__row">
                  <div class="movements__type movements__type--${depositType}">${
    i + 1
  } ${depositType}</div>
                  <div class="movements__date">${displayDate}</div>
                  <div class="movements__value">${formattedMov}</div>
                 </div>`;

  return html;
}

function findDepositType(movement) {
  const depositType = movement < 0 ? 'withdrawal' : 'deposit';

  return depositType;
}

//LOG MOVEMENTS TOTAL BALANCE (current balance)
function calcMovementsBalance(acc) {
  acc.balance = acc.movements.reduce((acc, value) => acc + value, 0);
  labelBalance.innerHTML = '$' + acc.balance;
}

//FIND MAXIMUM MOVEMENTS NUMBER
function calcMaxMovements(movements) {
  const maxValue = movements.reduce((acc, el) => {
    if (acc > el) return acc;
    else return el;
  }, movements[0]);
}

//CALC DISPLAY SUMMARY IN OUT AND INTEREST
function calcDisplaySummary(activeAccount) {
  const depositSum = activeAccount.movements
    .filter(sum => sum > 0)
    .reduce((acc, sum) => acc + sum);

  const withdrawSum = activeAccount.movements
    .filter(sum => sum <= 0)
    .reduce((acc, sum) => acc + sum, 0);

  const interest = activeAccount.movements
    .filter(sum => sum > 0)
    .map(sum => (sum * activeAccount.interestRate) / 100)
    .filter(sum => sum >= 1)
    .reduce((acc, sum) => acc + sum);

  return [depositSum.toFixed(2), withdrawSum.toFixed(2), interest.toFixed(2)];
}

//display In Out & Interest HTML
function displayMovementsHTML(movements) {
  const [depositSum, withdrawSum, interest] = calcDisplaySummary(movements);

  labelSumIn.innerHTML = '$' + depositSum;
  labelSumOut.innerHTML = `$${Math.abs(withdrawSum)}`;
  labelSumInterest.innerHTML = '$' + interest;
}

//--------------------------------------------------------------

//ABBREVIATE USERNAMES
function formatUserName(user) {
  const userName = user
    .toLowerCase()
    .split(' ')
    .map(el => el.at(0))
    .join('');
  return userName;
}

function createUserName(accountUser) {
  accountUser.forEach(
    account => (account.user = formatUserName(account.owner))
  );
}

//--------------------------------------------------------------------------------
//USER LOGIN VALIDATION
function login() {
  btnLogin.addEventListener('click', e => {
    loginValues(e);
    LoginButtonStartTime();
  });
}

function loginValues(e) {
  e.preventDefault();
  verifyAccount(accounts);
  clearInputValues();
}

//verify login details
function verifyAccount(accounts) {
  activeAccount = accounts.find(acc => {
    return (
      inputLoginUsername.value === acc.user && +inputLoginPin.value === acc.pin
    );
  });

  displayPage(activeAccount);
}

function displayPage(activeAccount) {
  if (activeAccount) {
    containerApp.style.opacity = 1;
    displayCurrentAccountData(activeAccount);
  } else {
    console.log('Wrong details');
  }
}

function clearInputValues() {
  inputLoginUsername.value = '';
  inputLoginPin.value = '';
  inputLoginPin.blur();
}

//greeting
function welcome(activeAccount) {
  labelWelcome.innerHTML = `Welcome back, ${
    activeAccount.owner.split(' ')[0]
  }!`;
}

//-------------------------------------------------------
//TRANSFERS
function transferMoneyButton() {
  btnTransfer.addEventListener('click', e => {
    e.preventDefault();
    findTransferAccount();
    clearValues(inputTransferAmount, inputTransferTo);
  });
}

function findTransferAccount() {
  if (inputTransferTo.value !== activeAccount.user) {
    const transferAccount = accounts.find(acc => {
      return inputTransferTo.value === acc.user;
    });
    TransferToAccount(transferAccount);
  } else {
    console.log("You can't send money to yourself");
  }
}

function TransferToAccount(transferAccount) {
  if (inputTransferAmount.value <= activeAccount.balance) {
    if (transferAccount && +inputTransferAmount.value > 0) {
      transferAccount.movements.push(Number(inputTransferAmount.value));
      transferAccount.movementsDates.push(new Date().toISOString());
      activeAccount.movements.push(Number(-inputTransferAmount.value));
      activeAccount.movementsDates.push(new Date().toISOString());
      displayCurrentAccountData(activeAccount);
    } else {
      console.log('please enter a valid account or number');
    }
  } else {
    console.log('insufficient funds to make this transfer');
  }
}

function clearValues(clear1, clear2 = clear1) {
  clear1.value = '';
  clear2.value = '';
}
//--------------------------------------------------------------
//DELETE ACCOUNT FUNCTIONALITY
function deleteAccountButton() {
  btnClose.addEventListener('click', e => {
    e.preventDefault();
    const deleteIndexNum = findClosedAccount(accounts);
    deleteAccount(deleteIndexNum, accounts);
    clearValues(inputCloseUsername, inputClosePin);
  });
}

function findClosedAccount(accounts) {
  const closeUser = inputCloseUsername.value;
  const closePin = +inputClosePin.value;

  if (closeUser === activeAccount.user && closePin === activeAccount.pin) {
    const closeIndexNum = accounts.findIndex(
      acc => acc.user === activeAccount.user
    );
    return closeIndexNum;
  } else {
    console.log('wrong username or pin');
  }
}

function deleteAccount(deleteIndexNum, acc) {
  if (deleteIndexNum !== null && deleteIndexNum !== undefined) {
    acc.splice(deleteIndexNum, 1);
    containerApp.style.opacity = 0;
    labelWelcome.innerHTML = 'Log in to get started';
  }
}
//---------------------------------------------
//LOAN FUNCTIONALITY

//only accepts a loan if there is a deposit that is atleast 10% of the requested loan ammount
function requestLoanButton() {
  btnLoan.addEventListener('click', e => {
    e.preventDefault();
    const [loanPercentage, loanAmount] = checkLoanAmount();
    const loanResult = checkLoanViability(activeAccount, loanPercentage);
    validateLoan(loanResult, loanAmount, activeAccount);
    clearValues(inputLoanAmount);
  });
}

function checkLoanAmount() {
  const loanAmount = +inputLoanAmount.value;
  const loanTenPercent = loanAmount / 10;
  return [loanTenPercent, loanAmount];
}

function checkLoanViability(activeAccount, loanPercentage) {
  return activeAccount.movements.some(num => num > loanPercentage);
}

function validateLoan(loanResult, loanAmount, activeAccount) {
  if (time > 3) {
    setTimeout(() => {
      if (loanResult && loanAmount > 0) {
        activeAccount.movements.push(loanAmount);
        activeAccount.movementsDates.push(new Date().toISOString());
        displayCurrentAccountData(activeAccount);
      } else {
        console.log('Sorry, that loan request is too high.');
      }
    }, 2000);
  } else {
    console.log('Try again later');
  }
}
//-----------------------------------------------------
//SORT MOVEMENTS
function buttonSort() {
  btnSort.addEventListener('click', () => {
    displayMovements(activeAccount, !flag);
    flag = !flag;
  });
}

//-----------------------------------
//SET DATES
//todays date

function setTodayDate() {
  const now = new Date();
  const day = `${now.getDate()}`.padStart(2, '0');
  const month = `${now.getMonth() + 1}`.padStart(2, '0'); //0 based
  const year = now.getFullYear();
  const hour = `${now.getHours()}`.padStart(2, '0');
  const min = `${now.getMinutes()}`.padStart(2, '0');

  labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
}

function createDates(datez) {
  const date = new Date(datez);
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0'); //0 based
  const year = date.getFullYear();

  const returnOutcome = `${day}/${month}/${year}`;

  const result = checkDaysBetween(new Date(datez), returnOutcome);

  return result;
}

function checkDaysBetween(movDate, returnOutcome) {
  const today = new Date();
  const daysBetween = Math.abs(
    Math.round((today - movDate) / (1000 * 60 * 60 * 24))
  );
  if (daysBetween > 7) return returnOutcome;
  if (daysBetween === 0) return 'Today';
  if (daysBetween === 1) return 'Yesterday';
  if (daysBetween > 1 && daysBetween <= 7) return `${daysBetween + 1} days ago`;
}

//------------
//fake login
// activeAccount = account1;
// displayCurrentAccountData(activeAccount);
// containerApp.style.opacity = 100;

//-----------------------------------------
//login timer
function startLogoutTimer() {
  time = 299;

  intervalTimer = setInterval(() => {
    const min = Math.trunc(time / 60)
    const sec = time % 60
    time--;
    labelTimer.innerHTML = `${min}:${sec}`;

    if (time === 0) {
      containerApp.style.opacity = 0;
      labelWelcome.innerHTML = 'Log in to get started';
      time = 100;
      clearInterval(intervalTimer);
    }
  }, 1000);
}

function clearTimer() {
  clearInterval(intervalTimer);
  startLogoutTimer();
}


function LoginButtonStartTime() {
  document.addEventListener('click', () => {
    clearTimer();
  });
}
