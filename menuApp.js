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
  const modify = document.getElementById('modify');
  const complete = document.getElementById('complete');
  const add = document.getElementById('add');
  const Delete = document.getElementById('delete');
  const table = document.getElementById('table');
  const btnLogout = document.getElementById('btnLogout');
  const viewId = document.getElementById('viewId');
  database= firebase.database(); //database init

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
      getMenu()
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

  function getMenu(){
    var menus = database.ref(id+'/menu');
    menus.on('value', snap=>
    {
      deleteList();//기존의 출력된 리스트를 삭제
      //child에 접근
      snap.forEach(function(childSnap){
        key = childSnap.key;
        var price = childSnap.val().price;
        var html =
        "<tr id=\"row\">"+
          "<td class=\"foodName\">" +key+ "</td>"+
          "<td class=\"foodPrice\">"+price+"원"+ "</td>"+
          "<td class=\"modify\">"+//값을 전달해주기위한 form 태그
            "<form methd=\"Post\" name=\"FoodName\">"+
              "<input type=\"hidden\" name=\"Fname\" id=\"Fname\" value=" +key+ ">"+
              "<input type=\"hidden\" name=\"Fprice\" id=\"Fprice\" value=" +price+ ">"+
            "</form>"+
            "<button type=\"submit\" class=\"ui inverted black button \" id=\"" +key+ "_modify\">수정</button>"+
          "</td>"+
          "<td class=\"delete\"> <button id=\"" +key+ "_delete\" class=\"ui inverted red button \">삭제</button> </td>"+
        "</tr>";
        $("#table").append(html);
        //수정과 삭제 버튼 listener등록
        listener(key);
      });
    });
  }

  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  function popupWin(win,data)
  {
    setTimeout(function(){
      var name=win.document.getElementById('name');
      $(name).val(data);
      $(name).text(data);
    }, 1000);

  }

  //수정과 삭제버튼을 linster에 등록하는 함수
  function listener(data)
  {

    document.getElementById(data+'_modify').addEventListener('click', e=>{
      var childWin = window.open('/modify.html', 'modify', 'width=400, height=480, location=no, fullscreen=no, scrollbars=yes, menubar=no, status=no, toolbar=no, resizable=no');
      childWin.addEventListener('load', popupWin(childWin, data));
    });

    document.getElementById(data+'_delete').addEventListener('click', e=>{
      if(confirm("해당 메뉴를 삭제 하시겠습니까?"))
      {
        //menu삭제후 name에 이름 식제
        database.ref(id+'/menu/'+data).remove();
        //스토리지에 이미지가 있을 경우 이미지 삭제
        var storageRef = firebase.storage().ref(id+'/'+data+".png").delete();
      }
    });
  }

  //table 표안의 내용이 있는지 없는지 확인하여 있을시 삭제;
  function deleteList()
  {
    const row = document.getElementById('row');
    if(row!=null)
    {
      while(table.childElementCount)
      {
       table.firstElementChild.remove();
      }
    }
  }
  // 완료 버튼 누를시 이전 페이지인 카운터 페이지로 이동
  complete.addEventListener('click', e=>
  {
    document.location.href="/counter.html";
  });

  //메뉴 추가 버튼 누를시 팝업창을 생성해서 수정할수 있도록 만듬
  add.addEventListener('click', e=>
  {
    window.open('/add.html', 'ddd', 'width=400, height=480, location=no, fullscreen=no, scrollbars=no, menubar=no, status=no, toolbar=no, resizable=no');
  });

}());
