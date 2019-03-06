(function()
{
  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyBVBviTsUBRT-mvzBwVul5Lzy7kSbtjUqU",
    authDomain: "project-a156d.firebaseapp.com",
    databaseURL: "https://project-a156d.firebaseio.com",
    projectId: "project-a156d",
    storageBucket: "project-a156d.appspot.com",
    messagingSenderId: "967997686089"
  };
  firebase.initializeApp(config);

  const auth = firebase.auth();   //firebase의 인증 기능을 담아줄 변수
  const viewId = document.getElementById('viewId');
  const backSelect = document.getElementById('backSelect');
  const logout = document.getElementById('logout');
  const order_button = document.getElementById('order_button');

  var database; //database를 담아둘 변수
  var userInfo; //유저정보를 담아두는 변수
  var check=0; //완료된 주문이 있는지 check하는 변수

  //실시간으로 user의 인증 정보를 체크
  //firebaseUser는 모든 Firebase의 사용자
  //로그인 안했을시 firebaseUser의 값은 NULL
  firebase.auth().onAuthStateChanged(firebaseUser => {
   if(firebaseUser)
   {
     //로그인 성공
     userInfo = firebaseUser;
     userEmail = firebaseUser.email;
     //E-mail중 아이디만 가져옴
     var at=0;
     for(var i=0; i<userEmail.length;i++)
     {
       if(userEmail.charAt(i)=='@')
       {
         at=i;
         break;
       }
     }
     id=userEmail.substring(0,at);
     viewId.innerText=id+"님 어서오세요";

     //실행 함수
     getOrder(id);
   }
   else
   {
     //로그인 실패 및 로그인이 안되었을떄 로그인 페이지로 이동
     document.location.href="/index.html";
   }
  });

  function getOrder(id)
  {
    database = firebase.database().ref().child(id);
    var dbRefOrder = database.child('order');

    dbRefOrder.on('child_added', snap => {
      var key = snap.key; // table_num
      console.log(key);
      var complete = snap.val().complete;
      console.log(complete);
      //var foods = snap.val().foods;

      if(complete.toString() == 'y')
      {
        var html =
        "<table class=\"ui red table\" id=\"tableForm-" +key+ "\">"
        +"<thead>"
        +"<tr>"
        +"<th>" +key+ "번 테이블</th>"
        +"<th>"
        +"</th>"
        +"</tr>"
        +"</thead>";
        $("#container").prepend(html);


        var foods = firebase.database().ref('' +id+ '/order/' +key+ '/foods');
        console.log(foods);

        foods.on('value', function(snapshot)
        {
          snapshot.forEach(function(childSnapshot)
          {
            var c_key = childSnapshot.key;  // 음식 이름
            console.log(c_key);
            var number = childSnapshot.val().number;  //  음식 갯수
            console.log(number);

            var table = document.getElementById('tableForm-' +key);
            var rowlen = table.rows.length;
            var row = table.insertRow(rowlen);
            row.insertCell().innerHTML = ''+c_key+'';
            row.insertCell().innerHTML = ''+number+'개';

          });
        });
      }
    });

    dbRefOrder.on('child_removed', snap => {
      var key = snap.key; // table_num
      console.log(key);

      var temp = document.getElementById('tableForm-' +key);
      if(temp != null)
      {
        temp.outerHTML = "";
        delete temp;
      }
    });
/*
    dbRefOrder.on('child_changed', snap => {
      var key = snap.key; //  table_num
      var complete = snap.val().complete; //  complete여부

      if(complete.toString() == 'Y')
      {
        var temp = document.getElementById('table_form_' +key);
        if(temp != null)
        {
          temp.outerHTML = "";
          delete temp;
        }
      }
    });
*/

    dbRefOrder.on('value', function(snapshot)
    {
      //테이블이 하나도 없을 경우 없음 멘트 append
      if($("table[id|='tableForm']").length == 0)
      {
        var html = "<font color=\"gray\" id=\"none\">완료 처리된 주문이 없습니다.</font>";
        $("#container").append(html);
        console.log('nothing here');
      }

      //없음 멘트가 존재할 경우 이를 삭제
      if($("table[id|='tableForm']").length != 0)
      {
        var temp = document.getElementById('none');
        if(temp != null)
        {
          temp.outerHTML = "";
          delete temp;
        }
        console.log('something here');
      }
    });
  }


  //주문 현황 보기 버튼
  order_button.addEventListener('click', e=>
  {
    document.location.href="/kitchenWeb.html";
  });
  //버튼을 클릭시 select.html로 이동
  backSelect.addEventListener('click', e=>
  {
    document.location.href="/select.html"
  });
  //logout 버튼 클릭시 logout 하고 index.html로 이동
  logout.addEventListener('click', e=>
  {
    firebase.auth().signOut();
    window.alert("로그아웃 되었습니다.");
    document.location.href="/index.html";
  });


}());
