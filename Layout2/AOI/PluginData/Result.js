function ResultUnity(methodString, jsonString) {
    let parsedData = null;

    switch (methodString) {
        case "json":
            if (jsonString !== null && jsonString !== undefined) {
                try {
                    parsedData = JSON.parse(jsonString);
                } catch (e) {
                    console.warn("[ResultUnity] JSON 解析失敗！", {
                        錯誤訊息: e.message,
                        嘗試解析的字串: jsonString
                    });
                    return;
                }

                if (window.parent && window.parent !== window) {
                    if (parsedData && (parsedData.type || parsedData.id)) {
                        const messagePayload = {
                            type: parsedData.type || "unknown",
                            id: parsedData.id || "none"
                        };
                        console.log("[ResultUnity] 成功發送 JSON 消息到父視窗:", messagePayload);
                        window.parent.postMessage(messagePayload, "*");
                    } else {
                        console.warn("[ResultUnity] 準備傳送至父視窗的資料格式不完整:", parsedData);
                    }
                }
            }
            break;
        case "alert":
            if (jsonString !== null && jsonString !== undefined) {
                window.alert(jsonString);
            };
            break;
        default:
            if (window.parent && window.parent !== window) {
                console.log("[ResultUnity] 發送消息到父視窗 (default):", { type: methodString, id: jsonString });
                const messagePayload = {
                    type: methodString || "unknown",
                    id: jsonString || "none"
                };
                window.parent.postMessage(messagePayload, "*");
            }
            break;
    }
}

window.addEventListener("message", (event) => {
    if (event.data && event.data.type) {

        console.log("[iFrame] 接收到 React 指令類型:", event.data.type);
        const jsonString = JSON.stringify(event.data);

        if (window.gameInstance) {
            window.gameInstance.SendMessage(
                "BridgeManager",
                "OnReceiveMessage",
                jsonString
            );
        } else {
            console.warn("[iFrame] Unity 尚未載入，指令已被丟棄:", event.data.type);
        }
    }
});
