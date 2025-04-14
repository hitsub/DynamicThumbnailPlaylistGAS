//DynamicThumbnailPlaylist JsonExport
//Made by Hitsub

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
      for(let x=0;x< data[0].length;x++)
      {
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
    for (let chunk_i = 0; chunk_i < resultArray.length; chunk_i += 50)
    {
      let chunk = resultArray.slice(chunk_i, chunk_i + 50).map(item => item.videoId);
      var ids = chunk.join(",");
      
      // データを取得
      const response = YouTube.Videos.list('snippet', {
        id: ids
      });
      var response_i = 0;
      for(let block_i = 0; block_i < chunk.length; block_i++)
      {
        let resultElement = resultArray[chunk_i + block_i];
        if (resultElement != null && resultElement["videoId"] != '[object Undefined]')
        {
          let title = "LOADING";
          let channel = "FAILED";
  
          if (resultElement["videoId"] == response.items[response_i].id)
          {
            title = response.items[response_i].snippet.title;
            channel = response.items[response_i].snippet.channelTitle;
            response_i++;
  
            //これ以上レスポンスが無ければ抜ける
            if (response.items[response_i] == null){
              break;
            }
          }
          resultElement["title"] = title;
          resultElement["channel"] = channel;
        }
      }
    }
    return resultArray;
  }
  
  