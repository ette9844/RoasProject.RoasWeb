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
  const btnCounter = document.getElementById('btnCounter');
  const btnKitchen = document.getElementById('btnKitchen');
  const btnLogout = document.getElementById('btnLogout');
  const viewId = document.getElementById('viewId');

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
    }else {
      //로그인 실패 및 로그인이 안되었을떄 로그인 페이지로 이동
      document.location.href="/index.html";
    }
  });

  btnCounter.addEventListener('click', e=>
  {
    document.location.href="/counter.html";
  });

  //kicken button 을 눌렀을시 Kicken.html으로 이동
  btnKitchen.addEventListener('click', e=>
  {
    document.location.href="/kitchenWeb.html";
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

}());
