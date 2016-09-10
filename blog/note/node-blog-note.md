#学习node中遇到的问题总结

>1.Error: Error setting TTL index on collection : sessions
>
>这个问题一般就是版本的问题引起的，所以只需要在package.js中使用比较新的版本的即可，比如monogodb以及和connect-mongo搭配使用的时候。