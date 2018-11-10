var vid = document.getElementById('myvideo');
var scroll = true;
vid.addEventListener('play', function(){
  var interval = setInterval(function(){
    console.log(Math.ceil(vid.currentTime));
    var vidTime = Math.ceil(vid.currentTime);
    $('#time').val(vidTime);
    $.ajax({
      type: 'GET',
      url:`/api/comments/?time=${vidTime}`,
      success(data){
        for(var i=0; i< data.length; i++) {
          $('#comments').append(
            `<li>
              <h3 class='userinfo'>
                <img src=${data[i].user.image} />
                <span> ${data[i].user.username} </span>
              </h3>
              </div>
              <p id='comment'>${data[i].comment}</p>
              <p>time: ${Math.floor(data[i].time/60) + ':' + data[i].time%60} </p>
             </li>`
          );
        }
        if(scroll){
          $('#comments').animate({
            scrollTop: $('#comments').prop('scrollHeight')
          }, 500, function(){scroll = true});
        }
        showAllComment();
      },
      error(err){
        console.log(err);
      }
    });
    vid.addEventListener('pause', function(){
      clearInterval(interval);
    })
  },1000);
});
$('#urComment').submit(function(e){
  e.preventDefault();
  if($('#time').val() == 0){
    $('#time').val() = 1
  }
  $.ajax({
    method: 'POST',
    url: '/makecomment',
    data: {
        user: $('#user').val(),
        comment: $('#commentbody').val(),
        time: $('#time').val()
    },
    success(commentData) {
      console.log('success');
      console.log(commentData);
      $('#comments').append(
        `<li>
            <h3 class='userinfo'>
              <img src=${commentData.data.user.image} />
              ${commentData.data.user.username}
            </h3>
            <p id='comment'>${commentData.data.comment}</p>

            <p>time: ${Math.floor(commentData.data.time/60) + ':' + commentData.data.time%60} </p>
         </li>`
      );
      $('#commentbody').val('');
      $('#comments').animate({
        scrollTop: $('#comments').prop('scrollHeight')
      }, 500, function(){scroll = true});
      showAllComment();
    },
    error(err) {
      console.log(err);
    }
  });
});
function showAllComment(){
  $('#comments li').on('click', function(){
    var clone = $(this).clone(true);
    $('#allComment').html(clone);
  });
}
$('#comments').mouseenter(function(){
  scroll = false;
});
$('#comments').on('scroll', function(){
  scroll = false;
});
$('#comments').mouseleave(function(){
  scroll = true;
});
//.split('').slice(0,50).join('') + '...'
