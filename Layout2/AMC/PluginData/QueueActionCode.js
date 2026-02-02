document.addEventListener('DOMContentLoaded', function () {
    const dropArea = document.body;

    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    dropArea.addEventListener('drop', function (e) {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target.result;
                gameInstance.SendMessage("QueueActionCode", "StartQueue", text);
            };
            reader.readAsText(file);
        }
    });
});
