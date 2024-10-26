"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const products_1 = require("../mockData/products");
async function handler(event) {
    const productId = event?.pathParameters?.productId;
    const product = products_1.products.find((p) => p.id === productId);
    if (product) {
        return {
            statusCode: 200,
            body: JSON.stringify(product),
        };
    }
    else {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Product not found" }),
        };
    }
}
exports.handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1EQUFnRDtBQUVoRCxLQUFLLFVBQVUsT0FBTyxDQUNwQixLQUEyQjtJQUUzQixNQUFNLFNBQVMsR0FBRyxLQUFLLEVBQUUsY0FBYyxFQUFFLFNBQVMsQ0FBQztJQUNuRCxNQUFNLE9BQU8sR0FBRyxtQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxTQUFTLENBQUMsQ0FBQztJQUV6RCxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ1osT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO1NBQzlCLENBQUM7SUFDSixDQUFDO1NBQU0sQ0FBQztRQUNOLE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLENBQUM7U0FDdkQsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQsT0FBTyxDQUFDLE9BQU8sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHQgfSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xyXG5pbXBvcnQgeyBwcm9kdWN0cyB9IGZyb20gXCIuLi9tb2NrRGF0YS9wcm9kdWN0c1wiO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihcclxuICBldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnRcclxuKTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+IHtcclxuICBjb25zdCBwcm9kdWN0SWQgPSBldmVudD8ucGF0aFBhcmFtZXRlcnM/LnByb2R1Y3RJZDtcclxuICBjb25zdCBwcm9kdWN0ID0gcHJvZHVjdHMuZmluZCgocCkgPT4gcC5pZCA9PT0gcHJvZHVjdElkKTtcclxuXHJcbiAgaWYgKHByb2R1Y3QpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1c0NvZGU6IDIwMCxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocHJvZHVjdCksXHJcbiAgICB9O1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXNDb2RlOiA0MDQsXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogXCJQcm9kdWN0IG5vdCBmb3VuZFwiIH0pLFxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydHMuaGFuZGxlcjtcclxuIl19