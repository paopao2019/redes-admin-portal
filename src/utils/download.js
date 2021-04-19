
export const handleFileError = (res, fileName) => {
    let downloadUrl = window.URL.createObjectURL(new Blob([res]));  // res是blob
    let a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = fileName;
    let event = new MouseEvent("click");
    a.dispatchEvent(event);
    window.URL.revokeObjectURL(downloadUrl); //释放掉blob对象

}