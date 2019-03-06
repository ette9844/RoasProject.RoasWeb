(function()
{
  const config=
  {
    apiKey: "AIzaSyBVBviTsUBRT-mvzBwVul5Lzy7kSbtjUqU",
    authDomain: "project-a156d.firebaseapp.com",
    databaseURL: "https://project-a156d.firebaseio.com",
    projectId: "project-a156d",
    storageBucket: "project-a156d.appspot.com",
    messagingSenderId: "967997686089"
  }; //firebase 와 연동

  firebase.initializeApp(config);
  const auth = firebase.auth();
  //Dom으로 이전에 참조한거 가져오기
  const table = document.getElementById('table');
  const btnLogout = document.getElementById('btnLogout');
  const viewId = document.getElementById('viewId');
  database= firebase.database(); //database init
  var yesButton=0;//확인 버튼을 눌렀는지
  var popup=0;//확인창의 유무

  //로그인한 음식점의 Id를 가져옴
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser){
      //로그인 성공
      userInfo = firebaseUser.email
      //E-mail중 아이디만 가져옴
      var at=0;
      for(var i=0; i<userInfo.length;i++)
      {
        if(userInfo.charAt(i)=='@')
        {
          at=i;
          break;
        }
      }
      id=userInfo.substring(0,at);
      //viewId의 내용에 id를 넣는다.
      viewId.innerHTML=id+' 님 어서오세요';
      getList();  //complete의 목록을 가져온다.
    }else {
      //로그인 실패 및 로그인이 안되었을떄 로그인 페이지로 이동
      document.location.href="/index.html";
    }
  });

  //Logout button 을 눌렀을시 logout을 한다.
  //logout 하고 로그아웃이 되었다고 알림 창을 띄어준 후
  //처음 로그인 페이지로 이동
  btnLogout.addEventListener('click', e=>
  {
    firebase.auth().signOut();
    window.alert("로그아웃 되었습니다.");
    document.location.href="/index.html";
  });

  function getList(){
    var completeList = database.ref(id+'/complete');
    completeList.on('value', snap=>
    {
      //이미 리스트가 존재할떄 삭제하고 출력
      deleteList();
      //child에 접근
      snap.forEach(function(childSnap)
      {
        //html 페이지에 출력
        var key = childSnap.key;
        var keyMonth = key.substr(0,2);
        var keyDay = key.substr(2,2);
        var keyHours = key.substr(4,2);
        var keyMin = key.substr(6,2);
        var keySec = key.substr(8,2);
        var timeString = keyMonth +" 월 "+ keyDay +" 일 " + keyHours + " 시 " + keyMin + " 분 " + keySec + " 초 결제";
        var html =
          "<p id=\"cont\">"+
          "<button id="+key+" class=\"checkButton ui basic black button\" style=\"padding: 0px;\">선택</button>"+
          "<button id=\""+key+"_del\" class=\"delButton ui red basic button\" style=\"padding: 0px;\">삭제</button>"+// "+key+", "+childSnap.val().seat+" 테이블"+
          "<table id=\""+key+"_T\" class=\"com ui red table\" style=\"  margin-top:5px; margin-bottom:20px;\">";
            //complete의 foods에 접근 하여 항목을 html에 추가
        html +=
          "<thead><tr><th colspan=\"2\" class=\"tableNumber\" style=\"text-align: right\">"+timeString+"</br>"+childSnap.val().seat+" 테이블"+
          "</th></tr></thead><tbody>";
        var childFoods = database.ref(id+'/complete/'+key+'/foods')
        childFoods.on('value',snap=>{
          snap.forEach(function(childSnap){
            html +=
              "<tr>"+
                "<td colspan=\"1\" class=\"food\" >"+childSnap.key+"</td>"+
                "<td class=\"number\" style=\"text-align: right; padding-right:20px;\">"+childSnap.val().number+" 개</td>"+
              "</tr>"+
              "<tr>"+
                "<td class=\"price\" colspan=\"2\" style=\"text-align: right; padding-right:20px\">"+childSnap.val().sum+" 원</td>"+
              "</tr>";
              });
              //전체 종액 추가
          });
            html +="<tr>"+
              "<td class=\"food\">총액 </td>"+
              "<td class=\"priceButton\" style=\"text-align: right;padding-right:20px\">"+childSnap.val().sum+" 원</td>"+
              //"<td class=\"delButton\"><button id=\""+key+"_del\" >삭제</button>"+
              "</td>"+
            "</tr>"+
          "</table>"+
        "</p>";
        $("#table").append(html);
        listener(key);
      });
    });
  };

  function deleteList(){
    const row = document.getElementById('cont');
    if(row!=null)
    {
      while(table.childElementCount)
      {
       table.firstElementChild.remove();
      }
    }
  }
  
  //각 항목에 대한 리스너 등록
  function listener(data){
    //선택 버튼에 대한 이벤트 등록
    var state = 0;
    document.getElementById(data).addEventListener('click', e=>
    {
      if(state == 0)
      {
        document.getElementById(data).className="checkButton ui black button";
        console.log(data+"가 선택됨");
        state =1;
      }
      else
      {
        console.log(data+"가 선택 해제됨");
        document.getElementById(data).className="checkButton ui basic black button";
        state=0;
      }//선택한 항목에 대한 삭제 리스너 등록
      popup=0;
      yesButton=0;
      document.getElementById('checkDel').addEventListener('click', e=>
      {
        if(state==1)
        {
          if(popup==0)  //팝업창의 존재 여부
          {
            if(yesButton=confirm("선택한 항목을 삭제 하시겠습니까?"))
            {
              popup=1;
              database.ref(id+'/complete/'+data).remove();
              state=0;
            }
            else{
              document.getElementById(data).className="checkButton ui basic black button";
              state=0;
            }
          } else
          {
            if(yesButton==1)
            {
              database.ref(id+'/complete/'+data).remove();
              state=0;
            }
            else{
              document.getElementById(data).className="checkButton ui basic black button";
              state=0;
            }
          }
        }
      });
    });
    //삭제버튼 이벤트 등록
    document.getElementById(data+"_del").addEventListener('click', e=>
    {
      if(confirm("해당 메뉴를 삭제 하시겠습니까?"))
      {
        database.ref(id+'/complete/'+data).remove();
      }
    });
  }
  document.getElementById('cencle').addEventListener('click', e=>
  {
    document.location.href="/counter.html";
  });
  btnLogout.addEventListener('click', e=>
  {
    firebase.auth().signOut();
    window.alert("로그아웃 되었습니다.");
    document.location.href="/index.html";
  });
}());
