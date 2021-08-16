```
git submodule add --depth 1 https://github.com/COVID19Tracking/covid-tracking-data.git  DataSet/CTP

git submodule add --depth 1 https://github.com/CSSEGISandData/COVID-19.git  DataSet/JH

git submodule add --depth 1 https://github.com/nytimes/covid-19-data.git  DataSet/NYT
```

```
git -C DataSet/JH config core.sparseCheckout true

git -C DataSet/CTP config core.sparseCheckout true
```

the sparse-checkout files were copied using:
```
cp .git/modules/DataSet/CTP/info/sparse-checkout ./submodule_config_files/CTP_sparse-checkout
cp .git/modules/DataSet/JH/info/sparse-checkout ./submodule_config_files/JH_sparse-checkout
```
flipped:
```
cp ./submodule_config_files/CTP_sparse-checkout  .git/modules/DataSet/CTP/info/sparse-checkout
cp ./submodule_config_files/JH_sparse-checkout .git/modules/DataSet/JH/info/sparse-checkout
```


after deleting should be able to use 
```
git submodule update --force --checkout
```
