var welcome = document.getElementById('welcome'),
    text = 'welcome to the video annotation app login to see the video and interact with it...',
    i = 0,
    interval = setInterval(function(){
      welcome.textContent += text[i];
      i += 1;
      if(i>= text.length){
        clearInterval(interval);
      }
    },100);
