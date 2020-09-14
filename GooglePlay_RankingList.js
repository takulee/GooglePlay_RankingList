//
// Google Playのランキングリストを取得する
//
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

//
// メイン処理
//
(async() => {

	// ブラウザを起動
	const browser = await puppeteer.launch({
		headless: false,
		slowMo: 100
	});

	// リスト作成対象は以下のURL
	let URLList = [
		["無料（アプリ）", "https://play.google.com/store/apps/collection/cluster?clp=0g4jCiEKG3RvcHNlbGxpbmdfZnJlZV9BUFBMSUNBVElPThAHGAM%3D:S:ANO1ljKs-KA&gsr=CibSDiMKIQobdG9wc2VsbGluZ19mcmVlX0FQUExJQ0FUSU9OEAcYAw%3D%3D:S:ANO1ljL40zU"],
		["人気（有料）アプリ", "https://play.google.com/store/apps/collection/cluster?clp=0g4jCiEKG3RvcHNlbGxpbmdfcGFpZF9BUFBMSUNBVElPThAHGAM%3D:S:ANO1ljLdnoU&gsr=CibSDiMKIQobdG9wc2VsbGluZ19wYWlkX0FQUExJQ0FUSU9OEAcYAw%3D%3D:S:ANO1ljIKVpg"],
		["売上トップのアプリ", "https://play.google.com/store/apps/collection/cluster?clp=0g4fCh0KF3RvcGdyb3NzaW5nX0FQUExJQ0FUSU9OEAcYAw%3D%3D:S:ANO1ljLe6QA&gsr=CiLSDh8KHQoXdG9wZ3Jvc3NpbmdfQVBQTElDQVRJT04QBxgD:S:ANO1ljKx5Ik"],
		["無料（ゲーム）", "https://play.google.com/store/apps/collection/cluster?clp=0g4cChoKFHRvcHNlbGxpbmdfZnJlZV9HQU1FEAcYAw%3D%3D:S:ANO1ljJ_Y5U&gsr=Ch_SDhwKGgoUdG9wc2VsbGluZ19mcmVlX0dBTUUQBxgD:S:ANO1ljL4b8c"],
		["人気（有料）ゲーム", "https://play.google.com/store/apps/collection/cluster?clp=0g4cChoKFHRvcHNlbGxpbmdfcGFpZF9HQU1FEAcYAw%3D%3D:S:ANO1ljLtt38&gsr=Ch_SDhwKGgoUdG9wc2VsbGluZ19wYWlkX0dBTUUQBxgD:S:ANO1ljJCqyI"],
		["売上トップのゲーム", "https://play.google.com/store/apps/collection/cluster?clp=0g4YChYKEHRvcGdyb3NzaW5nX0dBTUUQBxgD:S:ANO1ljLhYwQ&gsr=ChvSDhgKFgoQdG9wZ3Jvc3NpbmdfR0FNRRAHGAM%3D:S:ANO1ljIKta8"]
		];

	// リスト作成を呼び出す
	for (let idx = 0; idx < 6; idx++){
		await makeList(browser, URLList[idx]);
	}

	await browser.close();
})();

//
// リスト作成
//
async function makeList(browser, URLList){

	const page = await browser.newPage();
	await page.goto(URLList[1]);

	await page.evaluate(async () => {

		while (!document.querySelector('c-wiz[jsdata="deferred-c149"]')){
			// 全てのアプリが表示されるまで、ページを下にスクロールする
			document.scrollingElement.scrollBy(0, 500);
			await new Promise(resolve => {
				setTimeout(resolve, 100);
			});
		}

	});

		// アプリのリストを取得
		let appList = await page.$('div[class="ZmHEEd "]');
		let appArray = await appList.$$('div[class="RZEgze"]');

		// アプリ1個ずつ処理します
		for (let appIdx = 0; appIdx < appArray.length; appIdx++){

			// Anker
			let appAnker = await (await (await appArray[appIdx].$('a')).getProperty('href')).jsonValue();

			// アプリ名
			let appName = await (await (await appArray[appIdx].$('div[class="WsMG1c nnK0zc"]')).getProperty('textContent')).jsonValue();

			// 提供元
			let appPublisher = await (await (await appArray[appIdx].$('div[class="KoLSrc"]')).getProperty('textContent')).jsonValue();

			// アプリの詳細
			let appPage = await browser.newPage();
			await appPage.goto(appAnker);
			await appPage.waitForSelector('div[jsname="Gvbqzc"]');

			// アプリのカテゴリを取得する
			let appCategory = await (await (await (await appPage.$('div[class="qQKdcc"]')).$$('span'))[1].getProperty('textContent')).jsonValue();

			// アプリの更新日と現在のバージョンを取得する
			let appAdditionalInfo = await appPage.$$('div[class="hAyfc"]');
			let appAdditionalInfoName = "";
			let appUpdate = "";
			let appVersion = "";

			for (let counter = 0; counter < appAdditionalInfo.length; counter++){
				appAdditionalInfoName = await (await (await appAdditionalInfo[counter].$('div[class="BgcNfc"]')).getProperty('textContent')).jsonValue();
				if (appAdditionalInfoName == "更新日"){
					appUpdate = await (await (await appAdditionalInfo[counter].$('span[class="htlgb"]')).getProperty('textContent')).jsonValue();
					break;
				}
			}

			if (appUpdate == ""){
				appUpdate = "-";
			}

			for (let counter = 0; counter < appAdditionalInfo.length; counter++){
				appAdditionalInfoName = await (await (await appAdditionalInfo[counter].$('div[class="BgcNfc"]')).getProperty('textContent')).jsonValue();
				if (appAdditionalInfoName == "現在のバージョン"){
					appVersion = await (await (await appAdditionalInfo[counter].$('span[class="htlgb"]')).getProperty('textContent')).jsonValue();
					break;
				}
			}

			if (appVersion == ""){
				appVersion = "-";
			}

			await appPage.close();

console.log(appAnker);
console.log(appName);
console.log(appPublisher);
console.log(appCategory);
console.log(appUpdate);
console.log(appVersion);

			// アプリ情報をCSVに保存
			fs.appendFile(path.join(__dirname, "GooglePlay_RankingList.csv"),
				"\"" + URLList[0] + "\"," + String(appIdx + 1) + ",\"" + appName + "\",\"" + appPublisher + "\",\"" + appCategory + "\",\"" + appUpdate+ "\",\"" + appVersion + "\",\"" + appAnker + "\"\n", (error) => {
				if (error){
					console.error(error);
				}
			});
		}

	await page.close();
}
