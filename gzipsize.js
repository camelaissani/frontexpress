import bytesize from 'bytesize';

bytesize.gzipSize(__dirname + '/frontexpress.min.js', true, (err, size) => {
    console.log(`frontexpress size: ${size}(min+gzip)`);
});
