"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const products_1 = require("../mockData/products");
async function handler(event) {
    return {
        statusCode: 200,
        body: JSON.stringify(products_1.products),
        headers: {
            'Content-Type': 'application/json',
        },
    };
}
;
exports.handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1EQUFnRDtBQUVoRCxLQUFLLFVBQVUsT0FBTyxDQUNsQixLQUEyQjtJQUU3QixPQUFPO1FBQ0wsVUFBVSxFQUFFLEdBQUc7UUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBUSxDQUFDO1FBQzlCLE9BQU8sRUFBRTtZQUNQLGNBQWMsRUFBRSxrQkFBa0I7U0FDbkM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQUFBLENBQUM7QUFFRixPQUFPLENBQUMsT0FBTyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xyXG5pbXBvcnQgeyBwcm9kdWN0cyB9IGZyb20gJy4uL21vY2tEYXRhL3Byb2R1Y3RzJztcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIgKFxyXG4gICAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50XHJcbiAgKTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+IHtcclxuICByZXR1cm4ge1xyXG4gICAgc3RhdHVzQ29kZTogMjAwLFxyXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkocHJvZHVjdHMpLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgfSxcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0cy5oYW5kbGVyO1xyXG4iXX0=