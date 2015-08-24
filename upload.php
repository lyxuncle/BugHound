<?php
    //保存base64字符串为图片
    //匹配出图片的格式
    $base64_image_content = $_POST['pic'];
    $fileName = time().'_'.rand(100,999);

    if($base64_image_content){
       file_put_contents(
            'uploads/'.$fileName.'.jpg', 
            base64_decode($base64_image_content)
        );
        echo "http://labs.qiang.it/tools/bug/uploads/".$fileName.".jpg";
        exit(); 
    } 
?>