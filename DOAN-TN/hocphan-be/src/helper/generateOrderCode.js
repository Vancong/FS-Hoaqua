const CounterDtb=require("../models/Counter.Models")
const  generateOrderCode = async () => {
  let counter= await CounterDtb.findOne({name: 'orderCode'});
  if(!counter) {
    counter= new CounterDtb({
      name: 'orderCode',
      value:1
    })
  }
  else {
    counter.value+=1;
  }
  await counter.save();

  const paddedOrderNumber = String(counter.value).padStart(5, '0');

  return `ORD${paddedOrderNumber}`;
};

module.exports = generateOrderCode;