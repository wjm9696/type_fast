//TODO: change way submit form

import React, { Component } from 'react';
import './App.css';
import io from 'socket.io-client';


var currentRoomNum = -1;
var currentPos = -1;
var socket = io.connect('http://104.236.50.48:3001/');
//var socket = io.connect('http://localhost:3001/');

var room = [];

class App extends Component {


  render() {
    return (
      <div className="App">
        <Main></Main>
      </div>
    );
  }
};

var Main = React.createClass({
  getInitialState: function () {
    return {
      mainVisible: true,
      joinVisible: false,
      createVisible: false
    };
  },

  onClickJoin : function(){
    this.setState({
      mainVisible:false,
      joinVisible:true
    });
  },
  onClickCreate : function(){
    //console.log('...');
    this.setState({
      mainVisible:false,
      createVisible:true
    });
  },
  render(){
    return (
      <div>
      {this.state.mainVisible
      ?
      <div id="intro-interface-container">
        <h3>Welcome</h3>
        <div id="intro-button-container">
          <button id="join-button" className="waves-effect waves-light white btn cyan-text text-darken-4 btn-large" onClick={this.onClickJoin}>join</button>
          <button id="create-button" className="waves-effect waves-light white cyan-text text-darken-4 btn-large" onClick={this.onClickCreate}>create</button>
        </div>
      </div>
      :null}
      {this.state.joinVisible?<Join></Join>:null}
      {this.state.createVisible?<Create></Create>:null}
      </div>
    );
  }
});

var Join = React.createClass({
  getInitialState: function () {
    return {
      mainVisible: false,
      joinVisible: true,
      createVisible: false,
      gamePageVisible: false
    };
  },
  onClickJoin : function(){

    this.setState({
      joinVisible:false,
      gamePageVisible:true
    });
    var info = new Object();
    info.roomNum = this.state.roomNumber;
    info.name = this.state.nickName;
    socket.emit('join_room',JSON.stringify(info));
    var self = this;
    socket.on('success_room_info',function(info){
    	info = JSON.parse(info);

    	self.setState({roomNumber:info.roomNum,
                      members:info.members
      });
    });

  },
  onClickBack : function(){
    this.setState({
      mainVisible: true,
      joinVisible: false

    });
  },
  handleNameChange: function(e){
    this.setState({nickName: e.target.value});
  },
  handleRoomChange: function(e){
    this.setState({roomNumber: e.target.value});
  },
  render(){
    return(
      <div>
        {this.state.joinVisible?
        <div id="join-room-interface">
          	<h3>Join existing room</h3>
            <div id="join-button-container">
          	   <input type="text" name="Room number" id="join-room-number" value={this.state.roomNumber} onChange={this.handleRoomChange} placeholder="Room number"></input>
          	  <input type="text" name="Nickname" id="join-room-name" value={this.state.nickName} onChange={this.handleNameChange} placeholder="Your Nickname"></input>
            </div>
          	<button id="inner-join-button" className="waves-effect waves-light white btn cyan-text text-darken-4 btn-large" onClick={this.onClickJoin}>Join game</button>
            <button id="inner-join-button" className="waves-effect waves-light white btn cyan-text text-darken-4 btn-large" onClick={this.onClickBack}>Back</button>
        </div>
        :null}
        {this.state.mainVisible?<Main></Main>:null}
        {this.state.gamePageVisible?<Game members={this.state.members} room={this.state.roomNumber} owner={this.state.nickName}></Game>:null}
      </div>

    )
  }
});

var Create = React.createClass({
  getInitialState: function () {
    return {
      mainVisible: false,
      joinVisible: false,
      createVisible: true,
      gamePageVisible: false,

    };
  },
  onClickCreate : function(){
    var self = this
    this.setState({
      createVisible : false,
      gamePageVisible: true

    });
    socket.emit('create_room',this.state.nickName);
    socket.on('creator_get_room_number',function(roomNum){
      currentRoomNum = roomNum;
      self.setState({room: currentRoomNum})
      //console.log(currentRoomNum);

    	currentPos = 0;
    });
    socket.on('success_room_info',function(info){
    	info = JSON.parse(info);

      //console.log(info);
    	self.setState({roomNumber:info.roomNum,
                      members:info.members
      });
    });

  },
  onClickBack : function(){
    this.setState({
      mainVisible: true,
      createVisible: false
    });
  },
  handleNameChange: function(e){
    this.setState({nickName: e.target.value});

  },
  render(){
    //console.log(this.state.members);
    return(
      <div>
        {this.state.createVisible?
            <div id="create-room-interface">
        	   <h3>Create new game</h3>
        	    <input type="text" name="Nickname" id="create-room-name"  onChange={this.handleNameChange} placeholder="Put your name here"></input>

              <div id="create-room-button-container">
        	     <button id="inner-create-button" className="waves-effect waves-light white btn cyan-text text-darken-4 btn-large" onClick={this.onClickCreate} >Create game</button>
               <button id="inner-join-button" className="waves-effect waves-light white btn cyan-text text-darken-4 btn-large" onClick={this.onClickBack}>Back</button>
              </div>
            </div>
          :null
        }
        {this.state.mainVisible?<Main></Main>:null}
        {this.state.gamePageVisible?<Game room={this.state.room} owner={this.state.nickName} members = {this.state.members}></Game>:null}
      </div>

    )
  }
});


var Game = React.createClass({


  getInitialState: function () {

    return {
      mainVisible: false,
      joinVisible: false,
      createVisible: true,
      gamePageVisible: false,
      names:this.props.members,
      texts:[],
      hasStart:false,
      passageContent:'',
      information:'',
    };
  },
  onClickStart: function(){
    if(!this.state.hasStart){
      socket.emit('handleStartGame',this.props.room);
      console.log('start');


    }else{
      this.setState({hasStart:false});

      socket.emit('handleGameStop',this.props.room);


    }
  },

  onClickChange: function(){
    var roomNum = this.props.room;
    socket.emit('handle_passage_change',roomNum);


  },


  handleType: function(){
    console.log('type');
    var e = document.getElementById('self-type-input');
    var members;
    var name;
    var pos;
    if(!this.state.hasStart){

      var members = this.props.members;
      var name = this.props.owner;
      var pos = members.indexOf(name);
      this.state.texts[pos] = '';
      console.log(pos);
      console.log(this.state.texts);
      //this.setState({texts:this.state.texts});
      e.value='';
      return;
    }
    var input = e.value;
    var length = input.length;
    var correct = this.state.passage;
    var inputChar = input.charAt(length-1);
    var correctChar = correct.charAt(length-1);
    if(correctChar!==inputChar){
      e.value = input.substring(0,length-1);

      this.state.texts[pos] = e.value;
      this.setState({texts:this.state.texts});
      return;

    }
    var info = new Object();
    info.text = e.value;
    info.room = this.props.room;
    info.name = this.props.owner;
    info = JSON.stringify(info);
    socket.emit('type_change',info);
    if(correct===input){
      var info = new Object();
      info.winner = this.props.owner;
      info.roomNum = this.props.room;
      socket.emit("handleGameWin",info);
    }
  },

  countDown: function(seconds){
    var scope=this;
    if(seconds===-1){
      this.setState({information:'Game has started !'});
      this.setState({hasStart:true});
      document.getElementById("self-type-input").disabled = false;
      return;
    }
    setTimeout(function () {
        this.setState({information:'Game will start in '+ seconds+ " seconds"});

        return this.countDown(seconds-1);

    }.bind(scope), 1000);

  },
  componentWillMount: function(){

    socket.emit('getPassage',this.props.room);
    socket.on('passage_update',function(passageContent){
      console.log('passage update')

        this.setState({passage:passageContent});
        this.setState({information:'Passage has been changed'});
    }.bind(this));
    socket.on('start_update',function(info){
      var seconds = 3;
      var e = document.getElementById('start-button');
      e.innerText = "End Game";
      this.countDown(seconds);


    }.bind(this));
    socket.on('win_message',function(winner){
      console.log('win')
      this.setState({'information':winner+' has won!'})
      this.setState({'hasStart':false})
    }.bind(this));
    socket.on('stopGame',function(info){
      console.log('stop');
      this.setState({'hasStart':false});
      var e = document.getElementById('start-button');
      e.innerText = "Start";
      var e2 = document.getElementById('self-type-input');
      e2.value = "";
      this.setState({'information':info});
      this.setState({'texts':''})

    }.bind(this));

  },


  componentDidMount: function() {
    var e = document.getElementById('self-type-input');

    socket.on('text_update',function(msg){
      msg = JSON.parse(msg);
      var pos = msg.pos;
      var text =msg.text;
      //console.log(text);
      var oldtexts = this.state.texts;
      oldtexts[pos]=text;
      this.setState({texts:oldtexts});
      //console.log(this.state.texts);
    }.bind(this));
  },
  render(){
    var temp = this.props.members;
    let zip = (a1, a2) => a1.map((x, i) => [x, a2[i]]);
    // console.log("...");
    // console.log(this.props.members);
    // console.log(this.state.texts);
    //var nested = zip(this.props.member,this.state.texts);
    var rows = [];
    if(this.props.members!==undefined){
    for(var i = 0; i<this.props.members.length;i++){
      rows.push(
        <div className="player-container">
          <div className = "player-name">{this.props.members[i]}</div>
          <div className = "player-text">{this.state.texts[i]}</div>
          <div className = "clear"></div>
        </div>
      );
    }};
    //var resultList = nested.map(function(name){
    //   return(
    //     <div>{name+"......"}</div>
    //   );
    // });
    var resultList = <div>{rows}</div>
    return(
      <div id="game-interface">
        <h4 id="room-number-container">Welcome {this.props.owner}, this is Room {this.props.room}.</h4>
        <fieldset>
          <legend>The passage is</legend>
          <div id="passage-content">{this.state.passage}</div>
        </fieldset>

        <div>
         <input type="" name="" id="self-type-input" placeholder="Type here" onChange={this.handleType}></input>
        </div>
        {resultList}
        <div id="information">
          {this.state.information}
        </div>
        <div id="name-button-container">
          <button id="start-button" className="waves-effect waves-light white btn cyan-text text-darken-4 btn-large" onClick={this.onClickStart}>Start!</button>
          <button id="" className="waves-effect waves-light white btn cyan-text text-darken-4 btn-large" onClick={this.onClickChange}>change passage</button>

        </div>



      </div>

    )
  }
});

var Player = React.createClass({
  render(){

  }
})

export default App;
