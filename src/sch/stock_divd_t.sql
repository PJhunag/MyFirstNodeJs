CREATE TABLE `stock`.`divd_t` (
  `divd001` VARCHAR(40) NOT NULL, //股票代碼
  `divd002` INT NOT NULL,         //股利發放年度  
  `divd003` DATE NULL,            //除息交易日    
  `divd004` DOUBLE NULL,          //除息參考價(元)
  `divd005` DOUBLE NULL,          //平均股價      
  `divd006` DOUBLE NULL,          //殖利率        
  PRIMARY KEY (`divd001`, `divd002`))
COMMENT = '股利';
