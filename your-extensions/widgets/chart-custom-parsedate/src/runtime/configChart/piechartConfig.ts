export const DEFAULT_PIE_CHART_SETTINGS = {
    // Cấu hình chung cho biểu đồ
    chart: {
        height: "500px",            // Chiều cao mặc định của biểu đồ
        plotBackgroundColor: null, // Không có nền cho khu vực vẽ
        plotBorderWidth: null,     // Không có viền
        plotShadow: false,         // Không hiển thị bóng
    },
    // Cấu hình tiêu đề chính
    title: {
        text: "",                  // Nội dung mặc định trống
        align: "center",           // Tiêu đề căn giữa
        verticalAlign: "bottom",   // Tiêu đề nằm ở dưới biểu đồ
        style: {
            color: "#bababa",      // Màu chữ mặc định
            fontSize: "14px",      // Kích thước chữ tiêu đề
            fontFamily: "Arial",   // Font chữ mặc định
        },
    },
    // Cấu hình tiêu đề phụ
    subtitle: {
        text: "",                  // Nội dung mặc định trống
        align: "center",           // Tiêu đề phụ căn giữa
        style: {
            color: "#bababa",      // Màu chữ mặc định
            fontSize: "12px",      // Kích thước chữ tiêu đề phụ
            fontFamily: "Arial",   // Font chữ mặc định
        },
    },
    // Cấu hình tooltip (hiển thị thông tin khi hover)
    tooltip: {
        borderRadius: 5,           // Bo góc cho tooltip
        shadow: false,             // Không hiển thị bóng cho tooltip
    },
    // Cấu hình legend (chú giải)
    legend: {
        layout: "vertical",        // Hiển thị legend theo cột dọc
        align: "right",            // Căn legend sang bên phải
        verticalAlign: "middle",   // Đặt legend giữa theo chiều dọc
        maxHeight: 200,            // Chiều cao tối đa của legend
        width: 100,                // Chiều rộng cố định của legend
        x: 0,                      // Dịch ngang (mặc định 0)
        y: 0,                      // Dịch dọc (mặc định 0)
    },
    // Cấu hình responsive (thay đổi khi kích thước màn hình thay đổi)
    responsive: {
        rules: [
            {
                condition: {
                    maxWidth: 500, // Áp dụng khi chiều rộng nhỏ hơn hoặc bằng 500px
                },
                chartOptions: {
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                connectorWidth: 0, // Không hiển thị đường nối
                                distance: 10,      // Khoảng cách nhãn tới trung tâm
                                style: {
                                    fontSize: "10px", // Font nhỏ hơn khi màn hình nhỏ
                                },
                            },
                        },
                    },
                    legend: {
                        itemStyle: {
                            fontSize: "15px", // Font nhỏ hơn trong legend
                        },
                        maxHeight: 70,        // Chiều cao tối đa của legend
                        width: "auto",       // Chiều rộng tự động
                        verticalAlign: "bottom", // Legend căn ở dưới
                        layout: "horizontal",   // Legend hiển thị theo hàng ngang
                        align: "center",        // Legend căn giữa
                    },
                },
            },
            {
                condition: {
                    maxHeight: 400, // Áp dụng khi chiều cao nhỏ hơn hoặc bằng 400px
                },
                chartOptions: {
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                connectorWidth: 0, // Không hiển thị đường nối
                                distance: 10,      // Khoảng cách nhãn tới trung tâm
                                style: {
                                    fontSize: '30px', // Font kích thước lớn hơn
                                }
                            }
                        }
                    },
                    legend: {
                        itemStyle: {
                            fontSize: '15px', // Font của các mục trong legend
                        },
                        maxHeight: 70,        // Chiều cao tối đa của legend
                        width: 'auto',       // Chiều rộng tự động
                        verticalAlign: "bottom", // Legend căn ở dưới
                        layout: "horizontal",   // Legend hiển thị theo hàng ngang
                        align: "center"         // Legend căn giữa
                    }
                }
            }
        ],
    },
};
