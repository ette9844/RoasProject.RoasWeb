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
  const complete_button = document.getElementById('complete_button');
  const enterKey = document.getElementById('enterKey');
  const messaging =firebase.messaging();

  var database; //database를 담아둘 변수
  var userInfo; //유저정보를 담아두는 변수
  var check=0; //완료된 주문이 있는지 check하는 변수

  //메세징 알림 수신 권한 요청
  messaging.requestPermission()
  .then(function(){
    console.log('Notification permission granted.');
  })
  .catch(function(err) {
    console.log('Unable to get permission to notify.', err);
  });

  //현재 등록 토큰 검색
  messaging.getToken()
  .then(function(currentToken) {
    if(currentToken) {
      sendTokenToServer(currentToken);
      updateUIForPushEnabled(currentToken);
    } else {
      //permission request를 띄움
      console.log('No instance ID token available. Request permission to generate one.');
      //permission UI보이기
      updateUIForPushPermissionRequired();
      setTokenSentToServer(false);
    }
  })
  .catch(function(err) {
    console.log('An error occured while retrieving token. ', err);
    showToken('Error retrieving Instance ID token. ', err);
    setTokenSentToServer(false);
  })

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
    var orderState=0;
    console.log("orederState:"+orderState);
    //주문이 추가되었을 때
    dbRefOrder.on('child_added', snap => {

      // deleteList(orderState);
      var key = snap.key; // table_num
      console.log(key);
      var complete = snap.val().complete;
      console.log(complete);
      //var foods = snap.val().foods;

      if(complete.toString() == 'n')
      {
        //테이블 헤드 추가
        var html =
        "<table class=\"ui red table\" id=\"tableForm-" +key+ "\">"
        +"<thead>"
        +"<tr>"
        +"<th>" +key+ "번 테이블</th>"
        +"<th style=\"width: 210px;\">"
        +"<button class=\"ui red button\" id=\"cButton-" +key+ "\">"
        +"완료</button>"
        // +"</th>"
        // +"<th style=\"width: 150px;\">"
        +"<button class=\"ui blue button\" id=\"mButton-" +key+ "\">"
        +"메시지</button>"
        +"</th>"
        +"</tr>"
        +"</thead>";
        $("#container").append(html);

        var foods = firebase.database().ref( '' +id+ '/order/' +key+ '/foods');
        console.log(id);  //사용자 id->root
        console.log(foods);

        var token;
        var tokenRef = firebase.database().ref(id+'/order/'+key+'/token');
        tokenRef.once('value', function(snapshot){
            token = snapshot.val();
        });

        foods.on('value', function(snapshot)
        {
          snapshot.forEach(function(childSnapshot)
          {
            var c_key = childSnapshot.key;  // 음식 이름
            console.log(c_key);
            var number = childSnapshot.val().number;  //  음식 갯수
            console.log(number);

            var changedRow = document.getElementById(''+key+'-'+c_key+'');
            console.log(changedRow);

            if(changedRow != null)
              changedRow.parentNode.removeChild(changedRow);

            var table = document.getElementById('tableForm-' +key);
            var rowlen = table.rows.length;
            var row = table.insertRow(rowlen);
            //음식이름+갯수 행 추가
            row.id = ""+key+"-"+c_key+"";
            row.insertCell().innerHTML = ''+c_key+'';
            row.insertCell().innerHTML = ''+number+'개';

          });
        });

        //listener 에 완료 버튼 등록
        console.log(token);
        listener(key, id, token);
      }
    });

    //주문이 삭제되었을 때
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

    //주문이 수정되었을 때
    dbRefOrder.on('child_changed', snap => {
      var key = snap.key; //  table_num
      var complete = snap.val().complete; //  complete여부

      if(complete.toString() == 'y')
      {
        var temp = document.getElementById('tableForm-' +key);
        if(temp != null)
        {
          temp.outerHTML = "";
          delete temp;
        }
      }
    });

    //테이블 존재여부 검사
    dbRefOrder.on('value', function(snapshot)
    {
      orderState=1;
      //테이블이 하나도 없을 경우 없음 멘트 append
      if($("table[id|='tableForm']").length == 0)
      {
        var html = "<font color=\"gray\" id=\"none\">주문 현황이 없습니다.</font>";
        $("#container").append(html);
        console.log('nothing here');
      }

      //없음 멘트가 존재할 경우 이를 삭제
      if($("table[id|='tableForm']").length != 0)
      {
        var temp = document.getElementById('none');
        if(temp != null)
        {
          console.log('something here');
          temp.outerHTML = "";
          delete temp;
        }
        console.log('something here');
      }
    });
  }

  //완료버튼을 listener에 등록하는 함수
  function listener(data, id, token)
  {
    console.log(token);
    var complete_to_Y = 'y';
    document.getElementById('cButton-'+data).addEventListener('click', e=>{
      //완료버튼 기능
      var temp_update = {};
      temp_update[ '' + id + '/order/' + data + '/complete'] = complete_to_Y;

      return firebase.database().ref().update(temp_update);
    });

    //메시징 버튼
    document.getElementById('mButton-'+data).addEventListener('click', e=>{
      var http = getRequest();
      function getRequest() {
          try {
              xhr = new XMLHttpRequest();
            } catch (e) {
              try {
                  var xhr = new ActiveXObject("Microsoft.XMLHTTP");
              } catch (e) {
                try {
                  var xhr = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    alert("Your Browser is not Supported");
                }
              }
            }
            return xhr;
      }
      var url = "https://fcm.googleapis.com/fcm/send";
      console.log(token);
      http.open("POST", url, true);
      http.setRequestHeader("Content-Type", "application/json");
      http.setRequestHeader("Authorization", "key=AAAA4WEogUk:APA91bEtT0xBwvYOLbPuESsB8QgI6VsP_p1YnCWsneIUmBfmaKOf4CiamycF7HiUUly1FMYQS1ds-pStS4QeBDkneDRMbZhpKHeJMIU-fjBSWCJKXuu-tnrFQ-xgHNmM6bdezSXU3Hiw");

      // JSON.stringify 를 안써줄 경우
      http.send(JSON.stringify({
        notification : {
            // 알림 받을 기기에 보여줄 타이틀
            title : "음식 조리가 완료되었습니다!",
            // 알림 받을 기기에 보여줄 바디
            body : "음식 조리가 완료 되었습니다."
        },
        to : token
      }));
    })
  }

  //기존의 존재한 리스트 삭제
  function deleteList(orderState){
    const row = document.getElementById('container');
    console.log("number:"+orderState);
    if(orderState !=0)
    {
      // while(row.firstChild){
      //   console.log("d");
      //   row.firstElementChild.remove();
      // }
      var number = row.childElementCount;
      console.log("deleteNumber:"+orderState);
      for(var i=0; i<number; i++)
      {
        console.log("d");
        row.firstElementChild.remove();
      }
    }
  }


  //완료 처리 된 주문 보기 버튼
  complete_button.addEventListener('click', e=>
  {
    document.location.href="/kitchenWeb2.html";
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

/*
웹) ~08-07 수정사항

새 DB에 맡게 수정 -> 완료
오래 방치시 테이블 겹침생성 오류 확인 -> 이 오류가 가끔 떠서 미확인
엔터 keyup으로 맨윗 테이블 완료 처리 기능 -> 완료
같은 테이블에 두 주문이 들어왔을 경우 cButton의 id가 겹치는 것에대해 -> 디비의 ctime
변수가 제대로 된 값을 받을 때 구현

홈페이지 병합 -> 미완

*/
