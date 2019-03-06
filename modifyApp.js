(document.onload=function()
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
  database= firebase.database(); //database init
  //Dom으로 이전에 참조한거 가져오기
  const name = document.getElementById('name');
  const cencle = document.getElementById('cencle');
  const complete = document.getElementById('complete');
  const pic = document.getElementById('pic');
  const disable = document.getElementById('disable');
  var file="";

  //opener함수를 통해서 이전에 열려있던 data를 가져와 메뉴 이름에 표시
  /*$(document).ready(function() {
  var nameTemp = opener.document.FoodName.Fname.value;
  //$("#name").text(nameTemp);
  var priceTemp = opener.document.FoodName.Fprice.value;
  $("#price").text(priceTemp);
  });*/
  //로그인없는 접근에 대해 거부
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
    }else {
      //로그인 실패 및 로그인이 안되었을떄 로그인 페이지로 이동
      document.location.href="/index.html";
    }
  });

  setTimeout(function(){
    console.log(name.value);
  }, 2000);

  //취소를 눌렀을시 변경된 내용을 반영하지 않고 창만 닫는다.
  cencle.addEventListener('click',e=>
  {
    self.close();
  });

  //완료 버튼을 눌렀을시 변경된 내용을 DB에 저장한다.
  //DB접근하기위해 opener로 열려있는 창의 내용을 참조한다.
  complete.addEventListener('click',e=>
  {
    var inputRef = database.ref(id+'/menu/'+name.value);
    //menu에 이름추가
    console.log(name.value);
    inputRef.update(
    {
      contents : content.value,
      price : price.value
    });
    if(file=="")
    {
      window.close();
    }
  });

  pic.onchange =function(event)
  {
    //input에 있는거 가져오기 get File
    file = event.target.files[0];

    //creat a storage ref('folder_name/file_name')
    //storageRef로 저장된 장소 접근
    //file.name으로 접근
    var storageRef = firebase.storage().ref(id+'/'+name.value+".png");

    //on 함수를 이용하여 마지막에 등록된 것만 수행이 되도록 수정
    //완료 버튼을 눌렀을시
    //사진 첨부시
    complete.onclick=function(event)
    {
      //put을 이용하여 업로드
      var task = storageRef.put(file);
        task.on('state_changed',

          function progress(snapshot){
            disable.style.display='inline';
          },
          function error(err){

          },
          function complete(){
            self.close();
          }
      );
    };
  };

}());
