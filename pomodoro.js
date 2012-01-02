pomodoro = function() {
  var started = null,

	pomodoroduration = 25,
  
  hasNotStarted = function() {
    return started === null;
  };
  
  return {
    start: function(duration) {
			pomodoroduration = duration;
      started = system.now();
    },
    remaining: function() {
      if(hasNotStarted()) return { minutes: 25 };
      
      var diff, now, minutesRemaining;
      now = system.now();
      diff = now.getTime() - started.getTime();
      
      minutesRemaining = Math.floor(pomodoroduration - (diff / (1000 * 60)));
      secondsRemaining = Math.floor(((pomodoroduration-minutesRemaining)*60) - (diff / 1000));
      
      return { 
				minutes: minutesRemaining,
				seconds: secondsRemaining 
			};
    }
  };
};

