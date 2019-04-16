/* 
  State should live in parent, read this react article:
  https://reactjs.org/docs/lifting-state-up.html
  
  This doesn't pass the FCC test script
*/

const defaultLength = {
  break: 5, // minutes
  session: 25, // minutes
  timeLeft: 25 * 60 // seconds
};

const IMAGE_URLS = {
  break: 'https://images.unsplash.com/photo-1476673160081-cf065607f449?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1952&q=80',
  session: 'https://images.unsplash.com/photo-1489844097929-c8d5b91c456e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1652&q=80',
  tomato: 'https://images.unsplash.com/photo-1498522271744-cdd435c13f24?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1954&q=80' };


// Font Awesome icon names
const ICON_NAMES = {
  play: 'fas fa-play',
  pause: 'fas fa-pause' };


/**
                            Takes seconds and returns a string with mm:ss
                            If the input is 60 minutes or more (3600 seconds), I think only 59:59 will show in the display (not tested)
                           */
const convertToTimeFormat = seconds => {
  var date = new Date(null);
  date.setSeconds(seconds);
  var result = date.toISOString().substr(14, 5);
  return result;
};

/**
     Sets the background image based on the timer type
   */
const setBackground = image => {
  document.body.style.background = "url('" + IMAGE_URLS[image] + "') no-repeat bottom center fixed / cover";
};

/**
    * When user presses tab, add a class to the body
    * This is used to change the focus stylings on buttons. 
    * It assumes accessbility is only required if someone is using the tab key to navigate the buttons on the page.
    * Once you use the tab key, it always shows the focus outline even if you go back to a mouse.
   */
const handleFirstTab = e => {
  if (e.keyCode === 9) {
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  }
};

let timerID; // used to start and stop the timer

class SetDuration extends React.Component {
  render() {
    const timerType = this.props.timerType;

    return (
      React.createElement("div", { className: "set-duration" },
      React.createElement("button", { id: timerType + '-decrement', onClick: this.props.decrement.bind(this, timerType) }, "-"),
      React.createElement("div", { id: timerType + '-length' }, this.props.duration),
      React.createElement("button", { id: timerType + '-increment', onClick: this.props.increment.bind(this, timerType) }, "+")));


  }}


class Controls extends React.Component {
  render() {
    let startStopIcon;
    if (this.props.isTimerRunning === true) {
      startStopIcon = ICON_NAMES.pause;
    } else {
      startStopIcon = ICON_NAMES.play;
    }

    return (
      React.createElement("div", { id: "controls" },
      React.createElement("button", { id: "start_stop", onClick: this.props.toggleTimer },
      React.createElement("i", { className: startStopIcon })),


      React.createElement("button", { id: "reset", onClick: this.props.reset },
      React.createElement("audio", { id: "beep", src: "https://ccrma.stanford.edu/~jos/mp3/JazzTrio.mp3" }),
      React.createElement("i", { className: "fas fa-redo-alt" }))));



  }}


class Pomodoro extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeLeft: defaultLength.timeLeft,
      breakLength: defaultLength.break,
      sessionLength: defaultLength.session,
      timerClicks: 0,
      isTimerRunning: false,
      timerType: 'session' };


    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
    this.reset = this.reset.bind(this);
    this.timerCountdown = this.timerCountdown.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.toggleTimer = this.toggleTimer.bind(this);
  }

  increment(timerType) {
    if (timerType === 'break' && this.state.breakLength <= 60) {
      this.setState({
        breakLength: this.state.breakLength += 1 });

    } else if (timerType === 'session' && this.state.sessionLength <= 60) {
      this.setState({
        sessionLength: this.state.sessionLength += 1 });

    } else {
      throw new Error('Unexpected timerType in increment');
    }
  }

  decrement(timerType) {
    if (timerType === 'session' && this.state.sessionLength > 1) {
      this.setState({
        sessionLength: this.state.sessionLength -= 1 });

    } else if (timerType === 'break' && this.state.breakLength > 1) {
      this.setState({
        breakLength: this.state.breakLength -= 1 });

    } else {
      throw new Error('Unexpected timerType in decrement');
    }
  }

  reset() {
    // Stop music if it is playing
    let audio = document.getElementById('beep');
    audio.pause();
    audio.load();

    // Reset the timers to their default lengths
    this.setState({
      breakLength: defaultLength.break,
      sessionLength: defaultLength.session,
      timeLeft: defaultLength.timeLeft,
      timerClicks: 0,
      isTimerRunning: false,
      timerType: 'session' });


    setBackground('tomato');
    clearInterval(timerID);
  }

  timerCountdown() {
    if (this.state.timeLeft === 0) {
      // play beep sound
      let audio = document.getElementById('beep');
      audio.play();

      // Toggle the timer duration between break and session  
      if (this.state.timerType === 'session') {
        this.setState({
          timerType: 'break',
          timeLeft: this.state.breakLength * 60 + 1 });

      } else if (this.state.timerType === 'break') {
        this.setState({
          timerType: 'session',
          timeLeft: this.state.sessionLength * 60 + 1 });

      } else {
        throw new Error('Unexpected timerType in startTimer()');
      }

      setBackground(this.state.timerType);
    }

    this.setState({
      timeLeft: this.state.timeLeft -= 1 });

  }

  startTimer() {
    this.setState({
      isTimerRunning: true });


    // User story 18: timer starts running from user defined session length for the first click
    if (this.state.timerClicks === 0) {
      this.setState(
      { timeLeft: this.state.sessionLength * 60 }, () => {
        this.timerCountdown;
      });

      setBackground('session');
    }

    this.setState({
      timerClicks: this.state.timerClicks += 1 });


    timerID = setInterval(this.timerCountdown, 1000);
  }

  stopTimer() {
    this.setState({
      isTimerRunning: false });


    clearInterval(timerID);
  }

  // Toggle timer to start and stop
  toggleTimer() {
    if (this.state.isTimerRunning) {
      this.stopTimer();

    } else {
      this.startTimer();
    }
  }

  render() {
    window.addEventListener('keydown', handleFirstTab);

    let timerLabel = 'Pomodoro timer';
    if (this.state.timerType === 'session' && this.state.timerClicks === 0) {
      timerLabel = 'Pomodoro timer';
    } else if (this.state.timerType === 'session') {
      timerLabel = 'Busy working';
    } else {
      timerLabel = 'Busy playing';
    }


    return (
      React.createElement("div", { id: "pomodoro" },
      React.createElement("div", { id: "timer-label" }, timerLabel),

      React.createElement("div", { id: "main-wrapper" },
      React.createElement("div", { id: "main-display" },
      React.createElement("div", { id: "time-left" }, convertToTimeFormat(this.state.timeLeft)),

      React.createElement(Controls, { isTimerRunning: this.state.isTimerRunning,
        toggleTimer: this.toggleTimer,
        reset: this.reset }))),




      React.createElement("div", { id: "set-durations" },
      React.createElement("div", { id: "session" },
      React.createElement("div", { id: "session-label" }, "work"),
      React.createElement(SetDuration, { timerType: "session",
        increment: this.increment,
        decrement: this.decrement,
        duration: this.state.sessionLength })),


      React.createElement("div", { id: "break" },
      React.createElement("div", { id: "break-label" }, "play"),
      React.createElement(SetDuration, { timerType: "break",
        increment: this.increment,
        decrement: this.decrement,
        duration: this.state.breakLength })))));





  }}


ReactDOM.render(React.createElement(Pomodoro, null), document.getElementById('app'));