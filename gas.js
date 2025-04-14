function doGet() {
    //スクリプトに紐づいたアクティブなシートを取得
    const ss = SpreadsheetApp.getActiveSheet();
    //シート上から表を取得する(A1セルから最終行・最終列まで)
    const data = ss.getRange(2,1,ss.getLastRow() - 1,ss.getLastColumn()).getValues();
    //まずは配列形式で変数を定義
    let objectArray = [];
    //表頭がある前提でそれ以外の行数分forループ
    for(let y=1;y<data.length;y++){
      if (data[y][1] == "")
      {
        continue;
      }
      objectArray[y-1] = {};
      objectArray[y-1]["tags"] = [];
      //要素の列数分forループで表頭をキーに表データを格納
      for(let x=0;x< data[0].length;x++){
        // Logger.log(x + "," + y + " : " + data[y][x]);
        //URLはJSONに含めない
        if (x==1 || x == 2)
        {
          continue;
        }
        if (x >= 4)
        {
          if (data[y][x] != "")
          {
            objectArray[y-1]["tags"].push(data[y][x]);
          }
        }
        else
        {
          objectArray[y-1][data[0][x]] = data[y][x];
        }
      }
    }
    //オブジェクトの変数をJSON形式に変換
    const json = JSON.stringify(getYoutubeSnippet(objectArray));
    //そのままJSONをreturnできないためContentServiceを生成
    let output = ContentService.createTextOutput();
    //ContentServiceのMIMEタイプをJSONを設定し、JSONをセット
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(json);
    //Webアプリケーションの戻り値としてContentServiceのJSONを返却
    return output;
  }
  
  function getYoutubeSnippet(dataArray) {
    let resultArray = [...dataArray];
    for (let chunk_i = 0; chunk_i < resultArray.length; chunk_i += 50) {
      let chunk = resultArray.slice(chunk_i, chunk_i + 50).map(item => item.videoId);
      var ids = chunk.join(",");
      
      // データを取得
      const results = YouTube.Videos.list('snippet', {
        id: ids
      });
      for(let result_i = 0; result_i < results.items.length; result_i++){
        if (resultArray[chunk_i + result_i] != null)
        {
          resultArray[chunk_i + result_i]["title"] = results.items[result_i].snippet.title;
          resultArray[chunk_i + result_i]["channel"] = results.items[result_i].snippet.channelTitle;
        }
      }
    }
    return resultArray;
  }
  
  