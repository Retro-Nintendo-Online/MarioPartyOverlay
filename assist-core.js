var shortcutState = 0;
/*
* Variable shows the current state.
* 0 = Start game button
* 1 = Choose order
* 2 = Player's turn (all 4 players are in this state)
* 3 = Minigame
* 4 = Final 5
*/
var setup = false;
var turnCurPlayer = 0;
var orderCurPlayer = 0;
var shortcutGame = 'smp'; //Shortcut features use this instead of curGame as otherwise the player could change the game mid-shortcut which would break everything
var minigameSpaces = ['', '', '', '', ''];
var defaultText = '<span class="settingsText" style="width: 100%; white-space: normal; line-height: 30px;">	<span style="font-family: \'Mario\'; font-size: 17px;"> Games currently supported: </span> <span style="position: relative; top: 4px;"> <img src="img/mpds.png" style="height: 28px;"> <img src="img/smp.png" style="height: 28px;"> </span> <br>	Only 4 players without Teams (this includes Partner Party) are currently supported. <br> <br>A lot of features depend on the coin counter, it\'s recommended to show it and keep it up to date. <br>	This is currently in heavy development and some features might not work as intended. <br> <br>	<span onclick="startShortcut()" class="assistButton">Start game</span> <br> <br>	<!--button onclick="prepareShortcut(1)" style="margin: 20px 25px 0px 15px;">Start over</button> <button onclick="prepareShortcut(2)">Quick start</button> <br-->	<span class="settingsTitle"> What\'s Assist mode? </span> <br>	Assist mode is an optional feature which makes tracking all bonus stars a lot easier. Only select the numbers gotten, items used, space landed on etc and it automatically calculates the result and adds it to the counters. <br> It is recommended to use Settings Popout (bottom left) for this. <br> <span class="settingsNote">When switching from popout back to normal settings it might not display the correct state, just load the save from inside the assist settings (top left) when that happens.</span> <br> <br><span class="settingsTitle"> Report Bugs </span> <br>	In case something breaks or doesn\'t provide the expected output, please click on "Generate & Copy" and <a href="https://www.twitter.com/yoshisrc" class="settingsLink" rel="noopener" target="_blank">contact me</a> or <a href="https://github.com/blueYOSHI9000/MarioPartyOverlay/issues/new?template=bug_report.md" class="settingsLink" rel="noopener" target="_blank">open a Github issue</a> with a screenshot or copy-paste of your browsers console (Ctrl + Shift + I > "Console"). It shows the last actions done and potential errors. Thank you! <br> <br><span class="settingsTitle"> Potential broken features </span> <br>	Mario Party is hugely RNG based so some events are rare and as such hard to figure out how they work. <br>	Be sure to check your coin count after some of these as it might not be correct anymore:	<ul>		<li>SMP Minigame tied rewards</li>		<li>Battle Minigames (especially ties)</li>		<li>Lucky/ Extra- Bad Luck Events (some might even be missing)</li>		<li>VS space in SMP</li>		<li>MPDS Duel space</li>	</ul></span>';
/*
* Starts the shortcut feature or advances to the next state.
*/
function startShortcut () {
	if (popout == true && statSynced == false) { //if run in popout, sync all counters
		sendMessage('statSync');
		statSynced = true;
	}

	if (curGame != 'mpds' && curGame != 'smp') {
		shortcutNotif('The selected game is not supported.', true);
		return;
	}

	if (slots['a' + slots.sel].assistOn != true) {
		shortcutState = 0;
		setup = false;
		slots['a' + slots.sel].assistOn = true;
		saveAssist();
	}

	console.log('[MPO] Shortcut State: ' + shortcutState);
	document.getElementById('shortcutBattle').style.display = 'none';

	switch (shortcutState) {
		case 0: // start "choose order"
			document.getElementById('backButton').disabled = '';

			shortcutGame = curGame;
			shortcutState = 1;
			document.getElementById('shortcutTurn').style.display = 'none';
			playerOrder = [''];
			editInner('shortcutSpan', '<span class="settingsTitle"> Choose order </span> <br> <span class="settingsText" id="chooseOrderText"> Which character is first? </span> <br> <span> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[1] + '.png" class="chooseImg" id="chooseP1" onclick="chooseOrder(1)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[2] + '.png" class="chooseImg" id="chooseP2" onclick="chooseOrder(2)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[3] + '.png" class="chooseImg" id="chooseP3" onclick="chooseOrder(3)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[4] + '.png" class="chooseImg" id="chooseP4" onclick="chooseOrder(4)"> <br> <button onclick="chooseOrder(0, true)">Reset Order</button> <br> <span id="chooseFirst" class="chooseImgOrder"> </span> <br> <span id="chooseSecond" class="chooseImgOrder"> </span> <br> <span id="chooseThird" class="chooseImgOrder"> </span> <br> <span id="chooseFourth" class="chooseImgOrder"> </span> <br> <span id="chooseContinue" style="display:none;"> <button onclick="startShortcut()">Continue?</button> </span> </span>');
				shortcutNotif('Choose the order of the players.');
			break;

		case 1: // start "players turn"
			if (setup != true) {
				starPrice = 0;
				finalFiveEvent = '';
				prepareTurn();
				statusEffects = {
					p1: [],
					p2: [],
					p3: [],
					p4: []
				};
				allies = {
					p1: [],
					p2: [],
					p3: [],
					p4: []
				};
				starPrice = 0;
				setup = true;
			}
			minigameSpaces = ['', '', '', '', ''];
			shortcutState = 2;
			turnCurPlayer = 1;
			editInner('shortcutSpan', '');
			document.getElementById('shortcutTurn').style.display = '';
			document.getElementById('skipButton').disabled = '';


			editInner('turnPlayerName', getCharName(orderCurPlayer));
			document.getElementById('turnPlayerIcon').src = 'img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[orderCurPlayer] + '.png';

			editInner('turnHexCharSelection', '<span class="settingsText"> Select the character that placed the hex: </span> <br> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[1] + '.png" onclick="turnHex(1)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[2] + '.png" onclick="turnHex(2)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[3] + '.png" onclick="turnHex(3)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[4] + '.png" onclick="turnHex(4)">');
			orderCurPlayer = playerOrder[turnCurPlayer];
			document.getElementById('turnPlayerName').style.color = '';
			break;

		case 2: // start minigame
			shortcutState = 3;
			document.getElementById('shortcutTurn').style.display = 'none';
			if (shortcutGame === 'smp') {
				editInner('shortcutSpan', '<span class="settingsTitle"> Normal Minigame </span> <br> <span id="normalMinigame"> <span class="settingsText"> Select minigame type: </span> <br> <span class="shortcutText spanSelection"> <span onclick="startMinigame(\'4p\')"> 4-Player </span> <span onclick="startMinigame(\'2v2\')"> 2vs2 </span> <span onclick="startMinigame(\'1v3\')"> 1vs3 </span> </span> </span> <br> <br> <span class="settingsTitle"> Coin Minigame </span> <br> <span class="settingsText" style="white-space: normal;"> Add the coins gained in the minigame here, after pressing "Done" they will be added. </span> <br> <span id="coinMinigameSpan"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[1] + '.png"> <button onclick="coinMinigame(1, 5, \'M\')">-5</button> <button onclick="coinMinigame(1, 1, \'M\')">-1</button> <input type="number" id="coinMinigame1" style="width: 40px;" min="0" value="0"> <button onclick="coinMinigame(1, 1, \'P\')">+1</button> <button onclick="coinMinigame(1, 3)">+3</button> <button onclick="coinMinigame(1, 5, \'P\')">+5</button> <button onclick="coinMinigame(1, 10, \'P\')">+10</button> <br> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[2] + '.png"> <button onclick="coinMinigame(2, 5, \'M\')">-5</button> <button onclick="coinMinigame(2, 1, \'M\')">-1</button> <input type="number" id="coinMinigame2" style="width: 40px;" min="0" value="0"> <button onclick="coinMinigame(2, 1, \'P\')">+1</button> <button onclick="coinMinigame(2, 3)">+3</button> <button onclick="coinMinigame(2, 5, \'P\')">+5</button> <button onclick="coinMinigame(2, 10, \'P\')">+10</button> <br> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[3] + '.png"> <button onclick="coinMinigame(3, 5, \'M\')">-5</button> <button onclick="coinMinigame(3, 1, \'M\')">-1</button> <input type="number" id="coinMinigame3" style="width: 40px;" min="0" value="0"> <button onclick="coinMinigame(3, 1, \'P\')">+1</button> <button onclick="coinMinigame(3, 3)">+3</button> <button onclick="coinMinigame(3, 5, \'P\')">+5</button> <button onclick="coinMinigame(3, 10, \'P\')">+10</button> <br> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[4] + '.png"> <button onclick="coinMinigame(4, 5, \'M\')">-5</button> <button onclick="coinMinigame(4, 1, \'M\')">-1</button> <input type="number" id="coinMinigame4" style="width: 40px;" min="0" value="0"> <button onclick="coinMinigame(4, 1, \'P\')">+1</button> <button onclick="coinMinigame(4, 3)">+3</button> <button onclick="coinMinigame(4, 5, \'P\')">+5</button> <button onclick="coinMinigame(4, 10, \'P\')">+10</button> <br> <br> <button onclick="coinMinigame(\'done\')">Done</button> </span>');
				var blueS = [];
				var redS = [];
				for (var num = 1; num < 5; num++) {
					if (minigameSpaces[num] === 'blue') {
						blueS.push(0);
					} else if (minigameSpaces[num] === 'red') {
						redS.push(0);
					}
				}
				if (blueS.length === 4 || redS.length === 4) {
					startMinigame('4p');
				} else if ((blueS.length === 3 && redS.length === 1) || (blueS.length === 1 && redS.length === 3)) {
					startMinigame('1v3');
				} else if (blueS.length === 2 && redS.length === 2) {
					startMinigame('2v2');
				}
			} else {
				editInner('shortcutSpan', '<span class="settingsTitle"> Normal Minigame </span> <br> <span id="normalMinigame"> <span class="settingsText"> Who won? </span> <br> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[1] + '.png" class="chooseImg" id="p1Minigame" onclick="startMinigame(1)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[2] + '.png" class="chooseImg" id="p2Minigame" onclick="startMinigame(2)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[3] + '.png" class="chooseImg" id="p3Minigame" onclick="startMinigame(3)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[4] + '.png" class="chooseImg" id="p4Minigame" onclick="startMinigame(4)"> <br> <button onClick="startMinigame()">Done</button> </span> <br> <br> <span class="settingsTitle"> Coin Minigame </span> <br> <span class="settingsText" style="white-space: normal;"> Add the coins gained in the minigame here, after pressing "Done" they will be added. </span> <br> <span id="coinMinigameSpan"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[1] + '.png"> <button onclick="coinMinigame(1, 5, \'M\')">-5</button> <button onclick="coinMinigame(1, 1, \'M\')">-1</button> <input type="number" id="coinMinigame1" style="width: 40px;" min="0" value="0"> <button onclick="coinMinigame(1, 1, \'P\')">+1</button> <button onclick="coinMinigame(1, 3)">+3</button> <button onclick="coinMinigame(1, 5, \'P\')">+5</button> <button onclick="coinMinigame(1, 10, \'P\')">+10</button> <br> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[2] + '.png"> <button onclick="coinMinigame(2, 5, \'M\')">-5</button> <button onclick="coinMinigame(2, 1, \'M\')">-1</button> <input type="number" id="coinMinigame2" style="width: 40px;" min="0" value="0"> <button onclick="coinMinigame(2, 1, \'P\')">+1</button> <button onclick="coinMinigame(2, 3)">+3</button> <button onclick="coinMinigame(2, 5, \'P\')">+5</button> <button onclick="coinMinigame(2, 10, \'P\')">+10</button> <br> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[3] + '.png"> <button onclick="coinMinigame(3, 5, \'M\')">-5</button> <button onclick="coinMinigame(3, 1, \'M\')">-1</button> <input type="number" id="coinMinigame3" style="width: 40px;" min="0" value="0"> <button onclick="coinMinigame(3, 1, \'P\')">+1</button> <button onclick="coinMinigame(3, 3)">+3</button> <button onclick="coinMinigame(3, 5, \'P\')">+5</button> <button onclick="coinMinigame(3, 10, \'P\')">+10</button> <br> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[4] + '.png"> <button onclick="coinMinigame(4, 5, \'M\')">-5</button> <button onclick="coinMinigame(4, 1, \'M\')">-1</button> <input type="number" id="coinMinigame4" style="width: 40px;" min="0" value="0"> <button onclick="coinMinigame(4, 1, \'P\')">+1</button> <button onclick="coinMinigame(4, 3)">+3</button> <button onclick="coinMinigame(4, 5, \'P\')">+5</button> <button onclick="coinMinigame(4, 10, \'P\')">+10</button> <br> <br> <button onclick="coinMinigame(\'done\')">Done</button> </span> <br> <br> <span class="settingsTitle"> Battle Minigame </span> <br> <button onclick="editInner(\'shortcutSpan\', \'\'); document.getElementById(\'shortcutBattle\').style.display = \'\';">Start Battle Minigame</button>');
			}
			break;

		case 3: // turn finished - start next turn/final 5/end game
			if (getInner('curTurnText') == getInner('maxTurnText')) {
				shortcutState = 0;
				document.getElementById('shortcutTurn').style.display = 'none';
				document.getElementById('skipButton').disabled = 'true';

				if (shortcutGame === 'smp') {
					for (var num = 1; num < 5; num++) {
						document.getElementById(characters[num] + 'Ally').classList.remove('allySelectedChar');
						document.getElementById(characters[num] + 'Ally').classList.remove('allySelected');
					}	
				}

				editInner('shortcutSpan', defaultText);
				setup = false;
				shortcutNotif('Game completed! Start a new one?');
				//game done
			} else {
				shortcutState = 1;
				execOnMain('counterButtons', [1, 'P', 1, 'curTurn']);
				// Final 5 turns
				if ((getInner('curTurnText') == parseInt(getInner('maxTurnText')) - 4 && shortcutGame != 'smp') || (getInner('curTurnText') == parseInt(getInner('maxTurnText')) - 2 && shortcutGame === 'smp')) {
					startFinalFive();
				}
				startShortcut();
				return;
			}
			break;
	}
}

/*
* Prepares the shortcut turn screen depending on the selected game.
*/
function prepareTurn () {
	switch (shortcutGame) {
		case 'mpds':
			editInner('turnStars', 'Stars');
			editInner('turnStarsSelection', '<img src="img/stars.png" onclick="buyStar()"> <img src="img/shortcut/mpds/magicjarstars.png" style="margin-left: 50px;" onclick="buyStar(\'jarstar\')"> <img src="img/shortcut/mpds/magicjarcoins.png" onclick="buyStar(\'jarcoins\')"> <img src="img/shortcut/mpds/magicjarfail.png" onclick="buyStar(\'jarfail\')"> <br> <img src="img/shortcut/mpds/bluenote.png" onclick="buyStar(\'bluenote\')"> <img src="img/shortcut/mpds/greennote.png" onclick="buyStar(\'greennote\')"> <img src="img/shortcut/mpds/yellownote.png" onclick="buyStar(\'yellownote\')"> <img src="img/shortcut/mpds/orangenote.png" onclick="buyStar(\'orangenote\')"> <img src="img/shortcut/mpds/rednote.png" onclick="buyStar(\'rednote\')">');

			editInner('turnDiceTitle', 'Dice number rolled');
			editInner('turnDiceSelectionSpan', '<span id="turnDiceSelection" class="shortcutText spanSelection"> <span id="dice1" onclick="turnDice(this.id)">1</span> <span id="dice2" onclick="turnDice(this.id)">2</span> <span id="dice3" onclick="turnDice(this.id)">3</span> <span id="dice4" onclick="turnDice(this.id)">4</span> <span id="dice5" onclick="turnDice(this.id)">5</span> <span id="dice6" onclick="turnDice(this.id)">6</span> <span id="dice7" onclick="turnDice(this.id)">7</span> <span id="dice8" onclick="turnDice(this.id)">8</span> <span id="dice9" onclick="turnDice(this.id)">9</span> <span id="dice10" onclick="turnDice(this.id)">10</span> </span> <br> <img src="img/shortcut/mpds/diceblock.png" id="turnCurDice"> <span id="turnCurDiceText" class="shortcutText">??</span> <br> <br>');

			editInner('turnShoppingTitle', 'Shopping');
			editInner('turnShoppingSelection', '<span class="settingsNote"> Hold Ctrl to undo, same applies to stars. </span> <br> <span id="shoppingSpan" class="spanSelection shortcutText"> <span onclick="shopping(1)">1</span> <span onclick="shopping(2)">2</span> <span onclick="shopping(3)">3</span> <span onclick="shopping(7)">7</span> <br> <span onclick="shopping(8)">8</span> <span onclick="shopping(15)">15</span> <span onclick="shopping(20)">20</span> <span onclick="shopping(25)">25</span> </span>');

			editInner('turnItemsTitle', 'Items used');
			editInner('turnItems', '<img src="img/shortcut/mpds/double.png" id="itemDouble" onclick="turnItem(this.id)"> <img src="img/shortcut/mpds/triple.png" id="itemTriple" onclick="turnItem(this.id)"> <img src="img/shortcut/mpds/half.png" id="itemHalf" onclick="turnItem(this.id)"> <img src="img/hex.png" id="itemHex" onclick="turnItem(this.id)"> <span class="shortcutText" id="itemOther" onclick="turnItem(this.id)">Other</span>');

			editInner('turnSpacesTitle', 'Space landed on');
			editInner('turnSpaces', '<img src="img/shortcut/mpds/bluespace.png" id="spaceBlue" onclick="turnSpace(this.id)"> <img src="img/shortcut/mpds/redspace.png" id="spaceRed" onclick="turnSpace(this.id)"> <img src="img/shortcut/mpds/happeningspace.png" id="spaceHappening" onclick="turnSpace(this.id)"> <img src="img/shortcut/mpds/friendspace.png" id="spaceFriend" onclick="turnSpace(this.id)"> <img src="img/shortcut/mpds/duelspace.png" id="spaceDuel" onclick="turnSpace(this.id)"> <img src="img/shortcut/mpds/bowserspace.png" id="spaceBowser" onclick="turnSpace(this.id)">');

			document.getElementById('hexColumn').style.display = '';
			editInner('turnHexTitle', 'Hex landed on');
			editInner('turnHexSelection', '<img src="img/shortcut/mpds/coinsm10.png" id="coinsm10" onclick="turnHex(this.id)"> <img src="img/shortcut/mpds/coinsm20.png" id="coinsm20" onclick="turnHex(this.id)"> <img src="img/shortcut/mpds/coinswap.png" id="coinswap" onclick="turnHex(this.id)"> <img src="img/shortcut/mpds/starm1.png" id="starm1" onclick="turnHex(this.id)"> <img src="img/shortcut/mpds/starm2.png" id="starm2" onclick="turnHex(this.id)"> <img src="img/shortcut/mpds/spaceswap.png" id="spaceswap" onclick="turnHex(this.id)"> <img src="img/shortcut/mpds/coinblock.png" id="coinblock" onclick="turnHex(this.id)"> <img src="img/shortcut/mpds/starblock.png" id="starblock" onclick="turnHex(this.id)">');
			break;
		case 'smp':
			editInner('turnStars', 'Stars');
			editInner('turnStarsSelection', '<img src="img/stars.png" onclick="buyStar()"> <img style="margin-left: 45px;" src="img/shortcut/smp/lakitu.png" onclick="steal()"> <img style="margin-left: 45px;" src="img/ally.png" onclick="getAlly()"> <br> <span id="stealSpan"> </span> <span id="starPricesContainer" class="imgSelection"> <span class="settingsNote"> <i> Only </i> select a star price when playing on <br> Kamek\'s Tantalizing Tower. </span> <br> <span id="starPricesSpan"> <img src="img/shortcut/smp/kamek5.png" id="kamek5" onclick="starPrices(5)"> <img src="img/shortcut/smp/kamek10.png" id="kamek10" onclick="starPrices(10)"> <img src="img/shortcut/smp/kamek15.png" id="kamek15" onclick="starPrices(15)"> </span> </span>');

			editInner('turnDiceTitle', 'Dice number rolled');
			editInner('turnDiceSelectionSpan', '<div style="width: 350px; position: relative;"> <span style="position: absolute; right: 0;"> <span id="allyDice1" class="spanSelection shortcutText"> <img src="img/smp/rosalina.png" style="width: 30px;"> <span onclick="allyDice(1, 1)"> 1 </span> <span onclick="allyDice(1, 2)"> 2 </span> </span> <br> <span id="allyDice2" class="spanSelection shortcutText"> <img src="img/smp/bowser.png" style="width: 30px;"> <span onclick="allyDice(2, 1)"> 1 </span> <span onclick="allyDice(2, 2)"> 2 </span> </span> <br> <span id="allyDice3" class="spanSelection shortcutText"> <img src="img/smp/yoshi.png" style="width: 30px;"> <span onclick="allyDice(3, 1)"> 1 </span> <span onclick="allyDice(3, 2)"> 2 </span> 	</span>  <br> <span id="allyDice4" class="spanSelection shortcutText"> <img src="img/smp/bowserjr.png" style="width: 30px;"> <span onclick="allyDice(4, 1)"> 1 </span> <span onclick="allyDice(4, 2)"> 2 </span> </span> </span><span id="allyDiceSelection" class="imgSelection"> <img src="img/shortcut/smp/defaultdice.png" class="selected" onclick="changeAllyDice(0)"> <img src="img/smp/daisy.png" onclick="changeAllyDice(1)"> <img src="img/smp/bowser.png" onclick="changeAllyDice(2)" style="display: none;"> <img src="img/smp/peach.png" onclick="changeAllyDice(3)" style="display: none;"> <img src="img/smp/drybones.png" onclick="changeAllyDice(4)" style="display: none;"> <img src="img/smp/bowserjr.png" onclick="changeAllyDice(5)" style="display: none;"> </span>  <br><span id="turnDiceSelection" class="shortcutText spanSelection"> <span id="dice1" onclick="turnDice(this.id)">1</span> <span id="dice2" onclick="turnDice(this.id)">2</span> <span id="dice3" onclick="turnDice(this.id)">3</span> <span id="dice4" onclick="turnDice(this.id)">4</span> <span id="dice5" onclick="turnDice(this.id)">5</span> <span id="dice6" onclick="turnDice(this.id)">6</span> </span> <br> <img src="img/shortcut/mpds/diceblock.png" id="turnCurDice"> <span id="turnCurDiceText" class="shortcutText">??</span> </div> <br>');

			editInner('turnShoppingTitle', 'Shopping');
			editInner('turnShoppingSelection', '<span class="settingsNote"> Hold Ctrl to undo, same applies to stars. </span> <br> <span id="shoppingSpan" class="spanSelection shortcutText"> <span onclick="shopping(3)">3</span> <span onclick="shopping(5)">5</span> <span onclick="shopping(6)">6</span> <span onclick="shopping(10)">10</span> </span>');

			editInner('turnItemsTitle', 'Items used');
			editInner('turnItems', '<img src="img/shortcut/smp/mushroom.png" id="itemMushroom" onclick="turnItem(this.id)"> <img src="img/shortcut/smp/goldmushroom.png" id="itemGoldMushroom" onclick="turnItem(this.id)"> <img src="img/shortcut/smp/poisonmushroom.png" id="itemPoisonMushroom" onclick="turnItem(this.id)"> <br> <img src="img/shortcut/smp/coinado.png" id="itemCoinado" onclick="turnItem(this.id)"> <img src="img/shortcut/smp/allyphone.png" id="itemAllyPhone" onclick="turnItem(this.id)"> <span class="shortcutText" id="itemOther" onclick="turnItem(this.id)">Other</span>');
			// if partner party == true
			//editInner('turnItems', '<img src="img/shortcut/smp/mushroom.png" id="itemMushroom" onclick="turnItem(this.id)"> <img src="img/shortcut/smp/goldmushroom.png" id="itemGoldMushroom" onclick="turnItem(this.id)"> <img src="img/shortcut/smp/poisonmushroom.png" id="itemPoisonMushroom" onclick="turnItem(this.id)"> <img src="img/shortcut/smp/golddrink.png" id="itemGoldDrink" onclick="turnItem(this.id)"> <img src="img/shortcut/smp/peepabell.png" id="itemPeepaBell" onclick="turnItem(this.id)"> <br> <img src="img/shortcut/smp/coinado.png" id="itemCoinado" onclick="turnItem(this.id)"> <img src="img/shortcut/smp/duelglove.png" id="itemDuelGlove" onclick="turnItem(this.id)"> <img src="img/shortcut/smp/allyphone.png" id="itemAllyPhone" onclick="turnItem(this.id)"> <span class="shortcutText" id="itemOther" onclick="turnItem(this.id)">Other</span>');

			editInner('turnSpacesTitle', 'Space landed on');
			editInner('turnSpaces', '<img src="img/shortcut/smp/bluespace.png" id="spaceBlue" onclick="turnSpace(this.id)"> <img src="img/shortcut/smp/redspace.png" id="spaceRed" onclick="turnSpace(this.id)"> <img src="img/shortcut/smp/happeningspace.png" id="spaceHappening" onclick="turnSpace(this.id)"> <img src="img/shortcut/smp/allyspace.png" id="spaceAlly" onclick="turnSpace(this.id)"> <img src="img/shortcut/smp/itemspace.png" id="spaceItem" onclick="turnSpace(this.id)"> <img src="img/shortcut/smp/luckyspace.png" id="spaceLucky" onclick="turnSpace(this.id)"> <img src="img/shortcut/smp/badluckspace.png" id="spaceBadLuck" onclick="turnSpace(this.id)"> <img src="img/shortcut/smp/extrabadluckspace.png" id="spaceExtraBadLuck" onclick="turnSpace(this.id)"> <img src="img/shortcut/smp/vsspace.png" id="spaceVS" onclick="turnSpace(this.id)">');

			document.getElementById('hexColumn').style.display = 'none';

			document.getElementById('removeAllyChar1').children[0].src = 'img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[playerOrder[2]] + '.png';
			document.getElementById('removeAllyChar2').children[0].src = 'img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[playerOrder[3]] + '.png';
			document.getElementById('removeAllyChar3').children[0].src = 'img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[playerOrder[4]] + '.png';
			document.getElementById('allyDiceSelection').children[1].src = 'img/smp/' + characters[orderCurPlayer] + '.png';

			for (var num = 1; num < 5; num++) {
				document.getElementById(characters[num] + 'Ally').classList.add('allySelectedChar');
				document.getElementById(characters[num] + 'Ally').classList.add('allySelected');
			}			
			break;
	}
}

/*
* Starts Final Five.
*/
function startFinalFive () {
	shortcutState = 4;
	if (shortcutGame === 'smp') {
		finalFiveEvent = 'doubleSpaces';
		shortcutState = 1;
		shortcutNotif('Started Final 3 Turns.');
		startShortcut();
		return;
	} else {
		document.getElementById('skipButton').disabled = 'true';
		editInner('shortcutSpan', '<span class="shortcutText"> Final 5 Turns! </span> <br> <br> <span id="finalFiveTie"></span> <span class="settingsText"> Select the event: </span> <select id="finalFiveEvent"> <option value="20coins">Get 20 Coins</option> <option value="30coins">Get 30 Coins</option> <option value="1star">Get 1 Star</option> <option value="charity">Get 10 Coins from others</option> <option value="cheapStars">Stars for 5 coins</option> <option value="100stars">Get 100 Stars</option> <option value="300stars">Get 300 Stars</option> </select> <br> <br> <button onclick="finalFive()">Continue</button>');
	}

	lastPlace = getLastPlace();

	if (lastPlace.length > 1) {
		lastPlace = 0;
		editInner('finalFiveTie', '<span class="settingsText"> Select the last player: </span> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[1] + '.png" class="chooseImg" onclick="finalFive(1)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[2] + '.png" class="chooseImg" onclick="finalFive(2)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[3] + '.png" class="chooseImg" onclick="finalFive(3)"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[4] + '.png" class="chooseImg" onclick="finalFive(4)"> <br> <br>');
	} else if (shortcutGame === 'smp') {
		finalFive();
	}
}

var lastPlace;
var finalFiveEvent;
/*
* Does the selected final 5 turn event.
* 
* @param {number} player The player that should be selected (only used if there's a tie for the last place).
*/
function finalFive (player) {
	if (player) {
		var elems = document.getElementById('finalFiveTie').children;
		for (var num = 0; num < elems.length; num++) {
			elems[num].classList.remove('selected');
		}
		elems[player].classList.add('selected');
		lastPlace = player;
		return;
	}
	if (lastPlace == 0) {
		shortcutNotif('Select the character thats in the last place.', true);
		return;
	}
	finalFiveEvent = getValue('finalFiveEvent');

	switch (finalFiveEvent) {
		case '20coins':
			execOnMain('counterButtons', [lastPlace, 'P', 20, 'coins']);
			shortcutNotif('Final 5 Frenzy: ' + getCharName(lastPlace) + ' got 20 coins.');
			break;
		case '30coins':
			execOnMain('counterButtons', [lastPlace, 'P', 30, 'coins']);
			shortcutNotif('Final 5 Frenzy: ' + getCharName(lastPlace) + ' got 30 coins.');
			break;
		case '1star':
			execOnMain('counterButtons', [lastPlace, 'P', 1, 'stars']);
			shortcutNotif('Final 5 Frenzy: ' + getCharName(lastPlace) + ' got 1 star.');
			break;
		case 'charity':
			var charity = 0;
			for (var num = 1; num < 5; num++) {
				if (parseInt(getInner('p' + num + 'CoinsText')) < 10) {
					charity = charity + parseInt(getInner('p' + num + 'CoinsText'));
				} else {
					charity = charity + 10;
				}
				execOnMain('counterButtons', [num, 'M', 10, 'coins']);
			}
			execOnMain('counterButtons', [lastPlace, 'P', charity, 'coins']);
			shortcutNotif('Final 5 Frenzy: ' + getCharName(lastPlace) + ' got ' + charity + ' coins from others.');
			break;
		case 'cheapStar':
			finalFiveEvent = 'cheapStar';
			shortcutNotif('Final 5 Frenzy: Stars are now just 5 coins!');
			break;
		case '100stars':
			shortcutNotif('Final 5 Frenzy: ' + getCharName(lastPlace) + ' got something that shouldn\'t happen.');
			break;
		case '300stars':
			shortcutNotif('Final 5 Frenzy: ' + getCharName(lastPlace) + ' got something that shouldn\'t happen.');
			break;
	}
	document.getElementById('skipButton').disabled = '';
	shortcutState = 1;
	startShortcut();
}

var playerOrder;
/*
* Chooses the order used for many shortcut functions.
* 
* @param {number} player The player that should be selected.
* @param {boolean} reset If the order should be reset.
*/
function chooseOrder (player, reset) {
	if (shortcutState === 1) {
		if (reset === true) {
			playerOrder = [''];
			editInner('chooseFirst', '');
			editInner('chooseSecond', '');
			editInner('chooseThird', '');
			editInner('chooseFourth', '');
			document.getElementById('chooseContinue').style.display = 'none';

			for (var num = 1; num < 5; num++) {
				document.getElementById('chooseP' + num).setAttribute('onClick', 'chooseOrder(' + num + ')');
				document.getElementById('chooseP' + num).classList.add('chooseImg');
				document.getElementById('chooseP' + num).classList.remove('chooseImgSelected');
			}
			return;
		}

		playerOrder.push(player);
		document.getElementById('chooseP' + player).onclick = '';
		document.getElementById('chooseP' + player).classList.add('chooseImgSelected');
		document.getElementById('chooseP' + player).classList.remove('chooseImg');
		switch (playerOrder.length) {
			case 2:
				editInner('chooseFirst','<img src="img/1st.png"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[player] + '.png">');
				break;
			case 3:
				editInner('chooseSecond', '<img src="img/2nd.png"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[player] + '.png">');
				break;
			case 4:
				editInner('chooseThird','<img src="img/3rd.png"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[player] + '.png">');
				for (var num = 1; num < 5; num++) {
					if (playerOrder.includes(num) === false) {
						chooseOrder(num);
						return;
					}
				}
				break;
			case 5:
				editInner('chooseFourth', '<img src="img/4th.png"> <img src="img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[player] + '.png">');
				document.getElementById('chooseContinue').style.display = 'block';
				break;
		}
		orderCurPlayer = playerOrder[1];
	}
}

/*
* Ends the turn, empties all variables used in a turn.img/shortcut/smp/poisonmushroom.png"
*/
function turnEnd () {
	statusEffects['p' + orderCurPlayer] = [];
	turnCurPlayer++;
	if (turnCurPlayer == 5) {
		turnCurPlayer = 1;
		var done = true;
	}
	orderCurPlayer = playerOrder[turnCurPlayer];

	editInner('turnPlayerName', getCharName(orderCurPlayer));
	document.getElementById('turnPlayerIcon').src = 'img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[orderCurPlayer] + '.png';
	document.getElementById('turnPlayerName').style.color = '';

	spaceEventState = [];
	activeSpace = undefined;
	document.getElementById('turnCurDice').src = 'img/shortcut/mpds/diceblock.png';
	document.getElementById('spaceEventImg').src = '';
	editInner('spaceEventsSpan', '');
	battleResult = [];
	editInner('battleResult', '');
	document.getElementById('battleReset').style.display = 'none';
	activeHex = undefined;
	activeHexChar = undefined;
	hexCoins = undefined;
	var elems = document.getElementById('turnHexCharSelection').children;
	for (var num = 1; num < elems.length; num++) {
		elems[num].classList.remove('selected');
	}
	elems = document.getElementById('turnHexSelection').children;
	for (var num = 0; num < elems.length; num++) {
		elems[num].classList.remove('selected');
	}
	allyDiceRolls = ['', 0, 0, 0];
	diceCursor = undefined;
	diceRolls = [];
	elems = document.getElementById('turnSpaces').children;
	for (var num = 0; num < elems.length; num++) {
		elems[num].classList.remove('selected');
	}
	editInner('turnCurDiceText', '??');
	activeItem = undefined;
	poisonSub = 0;
	itemEventState = [];
	document.getElementById('itemImg').src = 'img/tie.png';
	elems = document.getElementById('turnItems').children;
	for (var num = 0; num < elems.length; num++) {
		elems[num].classList.remove('selected');
	}
	switch (shortcutGame) {
		case 'mpds':
			for (var num = 6; num < 11; num++) {
				document.getElementById('dice' + num).style.display = '';
			}
			break;
		case 'smp':
			editInner('stealSpan', ''); //close steal
			document.getElementById('starPricesContainer').style.display = 'unset';
			stealOpen = false;

			elems = document.getElementById('allyDiceSelection').children;
			for (var num = 0; num < elems.length; num++) {
				elems[num].classList.remove('selected');
			}
			elems = document.getElementById('allyDiceSelection').children;
			var elems2 = document.getElementById('removeAllySelection').children;
			elems[1].src = 'img/smp/' + characters[orderCurPlayer] + '.png';

			for (var num = 2; num < 6; num++) {
				if (allies['p' + orderCurPlayer][num - 2]) {
					elems[num].src = 'img/smp/' + allies['p' + orderCurPlayer][num - 2] + '.png';
					elems[num].style.display = 'initial';
					if ((num - 1) === 4) {
						if (bobombAlly[orderCurPlayer] != 0) {
							editInner('allyDice4', '<img src="img/smp/bobomb.png" style="width: 30px;"> <span onclick="allyDice(4, 1)"> 0 </span> <span onclick="allyDice(4, 2)"> -1 </span>');
						} else {
							editInner('allyDice4', '<img src="img/smp/' + allies['p' + orderCurPlayer][3] + '.png" style="width: 30px;"> <span onclick="allyDice(4, 1)"> 1 </span> <span onclick="allyDice(4, 2)"> 2 </span>');
						}
					} else {
						document.getElementById('allyDice' + (num - 1)).children[0].src = 'img/smp/' + allies['p' + orderCurPlayer][num - 2] + '.png';
					}
					document.getElementById('allyDice' + (num - 1)).style.visibility = 'visible';
				} else {
					elems[num].style.display = 'none';
					document.getElementById('allyDice' + (num - 1)).style.visibility = 'hidden';
				}
				document.getElementById('allyDice' + (num - 1)).children[1].classList.remove('selected');
				document.getElementById('allyDice' + (num - 1)).children[2].classList.remove('selected');
			}
			var num3 = 1;
			for (var num = 1; num < 5; num++) {
				if (num === orderCurPlayer) {
					for (var num2 = 0; num2 < 4; num2++) {
						if (allies['p' + num][num2]) {
							document.getElementById('removeAllySelection').children[num2].src = 'img/smp/' + allies['p' + num][num2] + '.png';
							document.getElementById('removeAllySelection').children[num2].style.visibility = 'visible';
						} else {
							document.getElementById('removeAllySelection').children[num2].style.visibility = 'hidden';
						}
					}
				} else {
					for (var num2 = 0; num2 < 4; num2++) {
						if (allies['p' + num][num2]) {
							document.getElementById('removeAllyChar' + num3).children[num2 + 1].src = 'img/smp/' + allies['p' + num][num2] + '.png';
							document.getElementById('removeAllyChar' + num3).children[num2 + 1].style.visibility = 'visible';
						} else {
							document.getElementById('removeAllyChar' + num3).children[num2 + 1].style.visibility = 'hidden';
						}
					}
					document.getElementById('removeAllyChar' + num3).children[0].src = 'img/' + document.querySelector('input[name="icons"]:checked').id + '/' + characters[num] + '.png';
					document.getElementById('removeAllyChar' + num3).setAttribute('player', num);
					num3++;
				}
			}
			if (bobombAlly[orderCurPlayer] != 0 && parseInt(getInner('curTurnText')) < (bobombAlly[orderCurPlayer] + 3)) {
				getAlly('bobomb', true);
			} else if (bobombAlly[orderCurPlayer] != 0) {
				removeAlly(orderCurPlayer, 4);
				bobombAlly[orderCurPlayer] = 0;
				shortcutNotif(getCharName(orderCurPlayer) + '\'s Bob-Omb exploded.');
			}

			if (characters[orderCurPlayer] === diceUsed[orderCurPlayer]) {
				changeAllyDice(1);
			} else {
				var runV = true;
				for (var num2 = 0; num2 < allies['p' + orderCurPlayer].length; num2++) {
					if (diceUsed[orderCurPlayer] === allies['p' + orderCurPlayer][num2]) {
						changeAllyDice(num2 + 2);
						runV = false;
						break;
					}
				}
				if (runV === true) {
					changeAllyDice(0);
				}
			}
			break;
	}
	editInner('statusEffects', '');
	for (var num2 = 0; num2 < statusEffects['p' + orderCurPlayer].length; num2++) {
		switch (statusEffects['p' + orderCurPlayer][num2]) {
			case 'poison':
				editInner('statusEffects', getInner('statusEffects') + '<img src="img/shortcut/smp/poisonmushroom.png">');
				break;
		}
	}
	closeAlly = false;
	getAlly('close');
	shortcutSettings(true);

	if (done && done == true) {
		startShortcut();
		return;
	}
}

if (slots['a' + slots.sel].assistOn === true) {
	loadAssistSlot();
} else {
	startShortcut();
}