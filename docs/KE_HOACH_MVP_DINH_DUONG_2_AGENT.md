# Kế hoạch MVP: Trợ lý dinh dưỡng cho người tập luyện cường độ cao

> Tài liệu giao việc cho 2 coding agent, thực hiện trong 120 phút. Phạm vi hiện tại là giao diện web tối ưu cho điện thoại, có dữ liệu và luồng tương tác chạy được; chưa xây dựng hệ thống máy chủ.

## 1. Mục tiêu và phạm vi

Tên sản phẩm đề xuất: **Bữa Việt — Ăn theo nhịp tập**.

Người dùng cung cấp thể trạng và lịch tập trong tuần để nhận kế hoạch dinh dưỡng tham khảo. Sau đó, họ chụp hoặc chọn ảnh món ăn, bổ sung mô tả khẩu phần, xác nhận thành phần và xem bữa ăn đóng góp thế nào vào kế hoạch trong ngày.

Hai chức năng bắt buộc:

1. **Tư vấn cá nhân hóa:** nhập cân nặng, chiều cao, giới tính, tuổi, mục tiêu, hình thức tập, cường độ và lịch tập 7 ngày; có thể chọn ảnh cơ thể; xem năng lượng, chất đạm, chất bột đường, chất béo và gợi ý ăn quanh buổi tập.
2. **Theo dõi bữa ăn:** chụp/chọn ảnh, nhập mô tả bằng tiếng Việt, xác nhận khẩu phần; xem dinh dưỡng ước lượng, ghi nhận bữa ăn, đối chiếu với mục tiêu trong ngày và gợi ý điều chỉnh.

Điểm riêng cần thể hiện trong bản demo: **món Việt, lịch tập theo ngày, khẩu phần sửa được và nguồn kiểm tra được**. Giao diện và thông báo hiển thị cho người dùng hoàn toàn bằng tiếng Việt; tên biến trong mã có thể dùng tiếng Anh.

### Giới hạn đã chốt

- Chỉ hỗ trợ tư vấn tự động cho người trưởng thành trong MVP. Người dưới 18 tuổi nhận thông báo cần chuyên gia hướng dẫn, không nhận kế hoạch tự động.
- Không đăng nhập, cơ sở dữ liệu, thanh toán, thiết bị đeo, thông báo đẩy, ứng dụng điện thoại native hoặc lịch sử nhiều tuần.
- Không tạo một chatbot tự do. Dùng biểu mẫu, kết quả có cấu trúc và những câu hỏi bổ sung ngắn.
- Không ước lượng phần trăm mỡ, khối lượng cơ, tình trạng bệnh hoặc nhu cầu năng lượng từ ảnh cơ thể.
- Không tự tính lượng vận động để “đốt hết” bữa ăn. Khi vượt mục tiêu, đề xuất điều chỉnh khẩu phần phù hợp và giữ lịch tập theo khả năng; không ép tập thêm hoặc bỏ bữa.
- Không hứa phân tích ảnh thật khi chưa có API nhận ảnh hoạt động. Bản mô phỏng phải ghi rõ trạng thái này.

## 2. Công nghệ và vị trí triển khai

- **React + TypeScript + Vite**, CSS thông thường và biểu tượng SVG đơn giản.
- Một ứng dụng duy nhất, chuyển màn hình bằng trạng thái React. Không cần thư viện định tuyến hoặc quản lý trạng thái riêng.
- Dùng một `App` giữ hồ sơ, kế hoạch, ngày đang xem và các bữa đã ghi nhận; truyền dữ liệu qua thuộc tính component.
- Các hàm tính toán thuần và một lớp dịch vụ nhỏ để thay mô phỏng bằng API sau này. Không làm hệ thống plugin hoặc nhiều nhà cung cấp AI.
- Dữ liệu hồ sơ, nhật ký và ảnh chỉ tồn tại trong bộ nhớ của phiên sử dụng. Tải lại trang thì xóa; thông báo rõ cho người dùng. Không đưa chúng vào `localStorage`, địa chỉ URL hoặc log.
- Đặt source tại **`chung-khao/tro-ly-dinh-duong/`**, theo thư mục vòng thi hiện tại. Tài liệu này nằm tại `docs/` theo yêu cầu người dùng. Không sửa trang `demo/` đang có hoặc dùng thiết kế bán trái cây làm giao diện dinh dưỡng.

```text
chung-khao/tro-ly-dinh-duong/
  package.json
  index.html
  README.md
  src/
    main.tsx
    App.tsx
    styles.css
    types.ts
    components/
      MacroSummary.tsx
      SourceList.tsx
      SafetyNotice.tsx
    features/
      profile/ProfileScreen.tsx
      plan/PlanScreen.tsx
      meal/MealScreen.tsx
      meal/meal.css
    data/
      foods.ts
      sources.ts
      fixtures.ts
    services/
      nutrition.ts
      assistant.ts
```

## 3. Luồng giao diện trên điện thoại

Thanh điều hướng dưới cùng có 3 mục: **Kế hoạch — Bữa ăn — Hồ sơ**. Lần mở đầu vào Hồ sơ; chưa có kế hoạch thì hướng dẫn hoàn tất hồ sơ trước khi đối chiếu bữa ăn.

### 3.1. Hồ sơ và tư vấn

Biểu mẫu chia thành 3 bước ngắn, có quay lại và giữ nội dung đã nhập:

| Bước | Nội dung | Quy tắc |
|---|---|---|
| Thể trạng | Tuổi, cân nặng (kg), chiều cao (cm), giới tính, mục tiêu | Bắt buộc số hợp lệ, dương; báo lỗi cạnh trường nhập; mục tiêu gồm duy trì, tăng cơ, giảm mỡ |
| Lịch tập | Loại hình tập, cường độ, lịch từ thứ Hai đến Chủ nhật | Mỗi ngày chọn nghỉ hoặc tập; ngày tập nhập giờ bắt đầu và số phút; có nút áp dụng cùng lịch cho các ngày được chọn |
| Ảnh và xác nhận | Chọn ảnh cơ thể, xem trước, xóa; xác nhận thông tin | Ảnh tùy chọn, có nút bỏ qua; không yêu cầu khuôn mặt hoặc ảnh nhạy cảm; thông báo mục đích xử lý |

Cho lựa chọn không cung cấp giới tính. Vì công thức năng lượng tham khảo cần tham số sinh lý nam/nữ, trường hợp này trả về khoảng theo hai biến thể và ghi rõ giới hạn, không tự suy đoán từ ảnh.

Nút cuối: **“Tạo kế hoạch tham khảo”**. Trong lúc xử lý hiển thị trạng thái chờ; lỗi dịch vụ có nút thử lại; không mất dữ liệu biểu mẫu.

Ảnh cơ thể ở bản frontend chỉ được chọn, xem trước và xóa. Nếu tích hợp AI nhận ảnh sau này, cần người dùng đồng ý trước khi gửi; chỉ dùng để bổ sung trao đổi về mục tiêu, không làm cơ sở suy luận chỉ số cơ thể. Ảnh không phải điều kiện để lập kế hoạch.

### 3.2. Kế hoạch dinh dưỡng

- Hàng chọn 7 ngày; mặc định ngày hiện tại. Mỗi ngày ghi rõ ngày tập/ngày nghỉ và giờ tập.
- Thẻ mục tiêu trong ngày: năng lượng, chất đạm, chất bột đường, chất béo, đơn vị rõ ràng và nhãn **“Ước lượng tham khảo”**.
- Gợi ý cấu trúc bữa sáng, trưa, tối và bữa phụ bằng thực phẩm Việt. Mỗi khẩu phần có lượng tham khảo và trạng thái dữ liệu; tổng các bữa đề xuất phải được tính từ thành phần.
- Khuyến nghị ăn trước/sau buổi tập dựa trên giờ tập và mục tiêu. Không kê thực phẩm bổ sung hoặc chế độ điều trị.
- Khu vực **“Đã ghi nhận hôm nay”**: tổng các bữa, tiến độ từng chỉ số, phần còn lại theo kế hoạch. Nếu chưa ghi đủ bữa, ghi rõ chưa thể kết luận cả ngày thiếu hoặc thừa.
- Nút **“Thêm bữa ăn”**, **“Sửa hồ sơ”** và mục mở rộng **“Cách tính và nguồn”**.
- Thay đổi hồ sơ/lịch tập sẽ tạo lại kế hoạch; các bữa trong phiên vẫn giữ nguyên và được đối chiếu với kế hoạch mới.

### 3.3. Chụp ảnh và đánh giá bữa ăn

1. Chọn bữa sáng/trưa/tối/bữa phụ; ngày ghi nhận lấy từ ngày đang xem.
2. Nút **“Chụp món ăn”** dùng `input type="file" accept="image/*" capture="environment"`; có **“Chọn từ thư viện”**. Trình duyệt có thể mở bộ chọn tệp thay camera, vẫn phải dùng được.
3. Có ô mô tả bắt buộc, ví dụ: “Một bát cơm, ức gà luộc, rau luộc; chưa rõ khối lượng”. Có thể phân tích bằng văn bản khi không có ảnh, đúng yêu cầu đề thi.
4. Hiển thị ảnh xem trước và nút thay/xóa. Giới hạn tệp 5 MB là giới hạn kỹ thuật của MVP; định dạng không đọc được thì hướng dẫn chọn JPEG/PNG/WebP hoặc nhập bằng văn bản.
5. Phân tích trả về các thành phần dự kiến. Cho sửa tên thực phẩm, khối lượng và cách chế biến; hỏi thêm dầu, nước sốt hoặc lượng ăn nếu cần. Không đoán chính xác gram từ một ảnh không có vật tham chiếu.
6. Tính lại kết quả sau khi người dùng sửa. Hiển thị tổng bữa ăn, bảng thành phần, nguồn, giả định và phần chưa đủ dữ liệu.
7. Đánh giá bữa trong bối cảnh các bữa đã ghi nhận và lịch tập. Khi chưa có kế hoạch, vẫn cho xem dinh dưỡng nhưng nhắc tạo kế hoạch để so sánh.
8. Bấm **“Ghi nhận bữa ăn”** mới cộng vào nhật ký. Không cộng trong lúc xem trước; khóa nút khi đang ghi để tránh cộng hai lần. Có thể xóa bữa và cập nhật lại tổng.

Nếu dịch vụ không nhận ra ảnh/món ăn, trả về **“Chưa đủ thông tin để ước lượng”** và đề nghị nhập thành phần, không tạo một kết quả chắc chắn giả.

## 4. Cách xử lý dinh dưỡng vừa đủ cho MVP

### Dữ liệu và nguồn

- Chuẩn bị khoảng 10–15 nguyên liệu phổ biến: cơm, thịt gà, thịt bò, trứng, cá, đậu phụ, rau, chuối, sữa… Chọn theo dữ liệu công khai thực sự tra cứu được.
- Mỗi thực phẩm lưu đơn vị trên 100 g phần ăn được, trạng thái sống/chín, năng lượng và 3 chất dinh dưỡng. Không lấy giá trị thực phẩm sống áp thẳng cho khối lượng đã nấu chín.
- Nguồn phải có tên tài liệu, đường dẫn công khai nếu có, và trang/bảng/mục đủ để kiểm tra. Chỉ dẫn tới trang chủ Viện Dinh dưỡng chưa đủ chứng minh một giá trị cụ thể.
- Nếu chưa tìm được giá trị, đánh dấu **“Ước lượng/chưa kiểm chứng”** hoặc để chưa có dữ liệu. Không gắn nhãn nguồn chính thống cho con số tự tạo.
- Công thức khẩu phần: `giá trị khẩu phần = giá trị trên 100 g × khối lượng ăn được / 100`.
- Bát, đĩa, muỗng hoặc khẩu phần suy ra từ ảnh là giả định. Người dùng có thể xác nhận/sửa, và tổng vẫn ghi là ước lượng nếu đầu vào còn ước lượng.
- Khi còn thành phần chưa có dữ liệu, hiển thị **“Tổng phần đã có dữ liệu”**. Không coi thành phần chưa biết bằng 0 hoặc dùng tổng đó để khẳng định bữa ăn thiếu.

### Kế hoạch cá nhân hóa

- Có thể dùng công thức Mifflin–St Jeor cho người trưởng thành: `10 × cân nặng kg + 6,25 × chiều cao cm − 5 × tuổi + 5` với biến thể nam; thay `+ 5` bằng `− 161` với biến thể nữ. Đây là ước lượng năng lượng nghỉ, không phải tổng nhu cầu ngày.
- Nguồn: Mifflin và cộng sự (1990), *A new predictive equation for resting energy expenditure in healthy individuals*, DOI: https://doi.org/10.1093/ajcn/51.2.241.
- Nhu cầu ngày lấy từ năng lượng nghỉ và hệ số vận động được công khai trong phần cách tính. Nếu chọn hệ số đơn giản cho demo, ghi **“Giả định vận động của bản thử nghiệm, chưa kiểm chứng cho cá nhân”**; không mặc nhận số buổi tập phản ánh đầy đủ hoạt động cả ngày, không gán hệ số tùy chọn cho FAO/WHO.
- Mức chất đạm tham khảo cho phần lớn người tập: 1,4–2,0 g/kg/ngày theo Jäger và cộng sự (2017), https://doi.org/10.1186/s12970-017-0177-8. Hiển thị khoảng và nguồn; điểm chọn cụ thể trong khoảng là đề xuất sơ bộ, không phải chỉ định cho mọi người.
- Tỉ lệ chất béo, chất bột đường và điều chỉnh theo mục tiêu nếu chưa có nguồn phù hợp thì ghi rõ là giả định chưa kiểm chứng. Không tự áp một mức cắt năng lượng lớn cho người tập nhiều.
- Khi tạo một bộ mục tiêu cụ thể, kiểm tra tổng năng lượng từ các chất theo quy ước `4 × đạm + 4 × bột đường + 9 × béo`; quy ước này là xấp xỉ, không ép dữ liệu năng lượng thực phẩm phải khớp tuyệt đối.
- Làm tròn kết quả hiển thị để tránh tạo cảm giác chính xác quá mức. Khi giới tính không cung cấp, giữ khoảng nhu cầu; không tự chọn trung điểm làm giá trị chắc chắn.

### Đối chiếu bữa ăn

- So sánh với tổng đã ghi nhận của **đúng ngày được chọn**, không lấy riêng một bữa để kết luận người dùng ăn thiếu cả ngày.
- Nếu còn dưới mục tiêu và dữ liệu đủ: “Bạn còn khoảng … theo kế hoạch đã đặt”; gợi ý thực phẩm bổ sung từ danh sách có dữ liệu, kèm khẩu phần tham khảo.
- Nếu tổng vượt mục tiêu: thông báo trung tính; gợi ý xem lại dầu/sốt, lượng ăn và điều chỉnh khẩu phần phù hợp. Không yêu cầu nhịn ăn hoặc tập bù để trừng phạt việc ăn.
- Không hiển thị độ tin cậy theo phần trăm khi chưa có phương pháp hiệu chuẩn. Dùng nhãn diễn giải như “Khối lượng do bạn cung cấp”, “Khẩu phần đang được ước lượng”, “Thiếu thông tin về dầu/sốt”.

## 5. Mô phỏng và tích hợp AI

MVP frontend phải có đường chạy hoàn chỉnh bằng dữ liệu mẫu. Mọi kết quả mẫu ghi **“Dữ liệu mô phỏng — chưa phân tích ảnh bằng AI”** ở gần kết quả, không chỉ trong phần hướng dẫn.

- Chỉ dùng các tình huống demo có khai báo trước; ảnh bất kỳ không được tự động trả về cùng một món ăn. Có nút **“Thử với bữa mẫu”** riêng.
- Khi nhập tên thực phẩm thuộc dữ liệu cục bộ, người dùng chọn/xác nhận thực phẩm và khối lượng để tính được thật bằng mã. Phần này ghi rõ dùng dữ liệu cục bộ.
- Không cần tạo quy trình nhận diện ảnh hoặc xử lý ngôn ngữ phức tạp phía trình duyệt để giả làm AI.
- Gom điểm nối AI vào `services/assistant.ts`; cấu hình có hai chế độ `demo` và `api`. Chỉ bật `api` nếu đã có điểm truy cập được ban tổ chức cho phép và thử được cả dữ liệu văn bản/ảnh cần thiết.
- Không đoán địa chỉ, tên mô hình hoặc cấu trúc API của ban tổ chức. Nếu API chỉ nhận văn bản, vẫn triển khai luồng văn bản và thông báo ảnh chưa được phân tích.
- Không nhúng khóa bí mật vào mã frontend, biến `VITE_*`, tệp dữ liệu hoặc URL. Nếu ban tổ chức chưa có cổng truy cập phù hợp cho trình duyệt, giữ bản frontend ở chế độ demo; bước tích hợp khóa cần một cổng trung gian nhỏ ở phạm vi tiếp theo.
- Dữ liệu AI trả về phải được kiểm tra cấu trúc, khối lượng hữu hạn/dương và nguồn trước khi dùng. AI nhận diện/thuyết minh; mã tính chỉ số từ dữ liệu kiểm tra được. Giá trị chỉ có từ AI phải đánh dấu chưa kiểm chứng.
- Lỗi mạng, dữ liệu sai hoặc hết thời gian chờ: giữ đầu vào, hiển thị thông báo tiếng Việt và cho thử lại; không âm thầm chuyển thành kết quả mẫu.

**Lưu ý về bài thi:** frontend mô phỏng là sản phẩm của phạm vi hiện tại; để đáp ứng đầy đủ yêu cầu cuộc thi về sử dụng AI API ban tổ chức, cần có ít nhất luồng tư vấn hoặc phân tích văn bản gọi API thật và chứng minh được khi demo. Không giới thiệu mô phỏng là đã hoàn thành yêu cầu này.

## 6. Hợp đồng dùng chung giữa hai agent

Agent 1 tạo `src/types.ts` trước. Hai agent thống nhất các nhóm dữ liệu sau và giữ nguyên tên trong quá trình làm:

| Kiểu | Trường chính |
|---|---|
| `UserProfile` | `age`, `weightKg`, `heightCm`, `sex: male/female/unspecified`, `goal: maintain/gainMuscle/loseFat`, `trainingType`, `trainingIntensity`, `weekSchedule` |
| `TrainingDay` | `weekday` từ 1 đến 7; `isRestDay`, `startTime`, `durationMinutes`; ngày nghỉ không cần giờ/thời lượng |
| `NutritionValues` | `caloriesKcal`, `proteinG`, `carbG`, `fatG`; không dùng giá trị mặc định 0 cho thông tin chưa biết |
| `NutritionSource` | `id`, `title`, `url?`, `locator?`, `status: verified/estimated/unverified` |
| `DailyPlan` | `weekday`, `targetMin`, `targetMax` dạng `NutritionValues`, `suggestedMeals`, `trainingAdvice`, `assumptions`, `sources`, `mode: demo/api` |
| `FoodItem` | `id`, `name`, `grams: number/null`, `preparation`, `nutrition: NutritionValues/null`, `sourceIds`, `estimated`, `missingInfo` |
| `MealAnalysis` | `items`, `knownTotal`, `isComplete`, `assumptions`, `followUpQuestions`, `advice`, `sources`, `mode: demo/api` |
| `MealEntry` | `id`, `dateKey` dạng ngày địa phương `YYYY-MM-DD`, `mealType`, `analysis`, `createdAt`; không chứa ảnh |

`targetMin` bằng `targetMax` khi dùng một giá trị mục tiêu; trường hợp khoảng thì giữ hai đầu khoảng. Hiển thị đánh giá vượt mục tiêu khi lớn hơn `targetMax`; ở dưới `targetMin` chỉ mô tả phần còn lại của nhật ký đã ghi nhận.

Ảnh là `File` hoặc URL xem trước tạm thời trong màn hình, không thuộc `UserProfile`/`MealEntry`. Thu hồi URL ảnh khi thay, xóa hoặc rời màn hình. Nếu tải ảnh lên API, thông báo và xin đồng ý trong giao diện trước khi gửi; không ghi ảnh/hồ sơ vào log.

Chữ ký dịch vụ chung:

```ts
createPlan(profile: UserProfile): Promise<DailyPlan[]> // 7 ngày
analyzeMeal(input: {
  description: string;
  image?: File;
  profile?: UserProfile;
  plan?: DailyPlan;
}): Promise<MealAnalysis>
recalculateMeal(items: FoodItem[]): MealAnalysis
```

Component chính:

```ts
ProfileScreen({ profile, onSubmit })
PlanScreen({ profile, plans, entries, selectedDate, onSelectDate, onAddMeal, onEditProfile, onDeleteMeal })
MealScreen({ profile, plan, entries, selectedDate, onSaveMeal })
```

Dùng callback vào `App` để lưu bữa; `MealScreen` không tự giữ một nhật ký tách biệt. Agent 1 khai báo kiểu thuộc tính component rõ ràng trước khi Agent 2 viết `MealScreen`.

## 7. Chia công việc cho 2 coding agent

### Agent 1 — Khung ứng dụng, hồ sơ và kế hoạch

**Sở hữu:** cấu hình Vite/package/lockfile, `index.html`, `main.tsx`, `App.tsx`, `styles.css`, `types.ts`, `components/`, `features/profile/`, `features/plan/` và hướng dẫn chạy ứng dụng.

Công việc theo thứ tự:

1. Khởi tạo ứng dụng ở đường dẫn đã chốt; chỉ cài React, TypeScript và Vite cùng dependency tối thiểu.
2. Tạo `types.ts`, xác nhận chữ ký dịch vụ và thuộc tính `MealScreen` với Agent 2 trong 10 phút đầu.
3. Tạo khung điện thoại, thanh điều hướng và component hiển thị 4 chỉ số, nguồn, thông báo an toàn.
4. Làm biểu mẫu 3 bước, kiểm tra dữ liệu, lịch tập 7 ngày, chọn/xóa ảnh cơ thể và xác nhận phạm vi xử lý ảnh.
5. Gọi `createPlan` của Agent 2; hiển thị mục tiêu, bữa gợi ý, giờ tập và nguồn theo ngày.
6. Quản lý nhật ký trong `App`; nối lưu/xóa bữa với màn kế hoạch, bảo đảm không cộng hai lần.
7. Viết README: cài đặt, lệnh chạy/build, giới hạn bản demo và cách nhận biết chế độ dữ liệu.

**Bàn giao:** giao diện hồ sơ và kế hoạch chạy được; trạng thái chờ/lỗi/rỗng đầy đủ; điểm nối màn Bữa ăn sẵn sàng.

### Agent 2 — Bữa ăn, dữ liệu và dịch vụ tư vấn

**Sở hữu:** `features/meal/`, `data/` và `services/`. Không sửa `App.tsx`, `types.ts`, CSS chung hoặc package/lockfile; cần đổi hợp đồng/dependency thì trao đổi với Agent 1.

Công việc theo thứ tự:

1. Nhận hợp đồng chung; chuẩn bị dữ liệu món Việt/nguồn và các tình huống mô phỏng được gắn nhãn rõ.
2. Viết tính khẩu phần, tổng chất dinh dưỡng và `createPlan`; ghi rõ mọi giả định về vận động và mục tiêu.
3. Viết `assistant.ts` với chế độ demo hoạt động trước, điểm nối API thật chỉ khi thông tin truy cập sẵn có.
4. Làm chụp/chọn ảnh, mô tả văn bản, xem trước/xóa ảnh và trạng thái đang phân tích/thất bại.
5. Làm bảng xác nhận nguyên liệu, sửa khối lượng/cách chế biến và tính lại kết quả; xử lý phần thiếu dữ liệu.
6. Đánh giá bữa ăn theo kế hoạch và nhật ký hiện có; gợi ý bổ sung/điều chỉnh an toàn, không tự động tập bù.
7. Bàn giao `MealScreen` dùng callback `onSaveMeal`; kiểm tra vòng chọn ảnh → sửa khẩu phần → ghi nhận.

**Bàn giao:** màn Bữa ăn chạy được độc lập với dữ liệu mẫu; bộ dữ liệu có nguồn/trạng thái; dịch vụ chung khớp chữ ký đã chốt.

### Quy tắc phối hợp

- Mỗi tệp chỉ có một agent sở hữu. Không tự tạo thêm một bộ kiểu, hệ thống màu hoặc nhật ký khác.
- Agent 1 quản lý tệp dùng chung. Agent 2 cung cấp component và dịch vụ theo hợp đồng.
- Trong lúc chờ dịch vụ, Agent 1 dùng dữ liệu mẫu tạm trong phạm vi tệp của mình; xóa dữ liệu tạm khi tích hợp, không duy trì hai cách tính.
- Đồng bộ ở phút 10, 45 và 80; đến phút 90 dừng thêm tính năng để tích hợp và sửa lỗi.
- Không thay cấu trúc hoặc chỉnh tệp không liên quan trong repository.

## 8. Hướng giao diện và nội dung

- Thiết kế ưu tiên màn rộng 360–430 px, vẫn dùng được ở 320 px; màn lớn căn giữa khung nội dung khoảng 480 px.
- Nền kem nhạt, màu xanh lá đậm làm màu chính, cam cho lời nhắc; thẻ bo góc, khoảng trắng rõ và biểu tượng món Việt/lịch tập. Không sao chép bố cục hoặc thương hiệu ứng dụng có sẵn.
- Font hệ thống; nội dung chính khoảng 16 px; vùng chạm tối thiểu 44 px. Các kích thước này là tiêu chí thiết kế, không phải dữ liệu dinh dưỡng.
- Dùng thanh tiến độ CSS; giá trị vượt mục tiêu vẫn hiển thị số thật, thanh chỉ giới hạn độ rộng. Không cần thư viện biểu đồ.
- Không dùng màu để truyền đạt trạng thái một mình; kèm chữ. Có nhãn trường nhập, tiêu điểm bàn phím rõ và thông báo lỗi dễ đọc.
- Nhãn dinh dưỡng: **Năng lượng (kcal), Chất đạm (g), Chất bột đường (g), Chất béo (g)**.
- Câu chữ trung tính: “Bữa này đóng góp … vào kế hoạch”, “Cần xác nhận lượng dầu”, “Nhật ký hôm nay chưa đầy đủ”; tránh “ăn sai”, “phải đốt hết”, “chắc chắn giảm mỡ”.

## 9. An toàn và riêng tư bắt buộc

Hiển thị trên màn tư vấn và kết quả bữa ăn:

> “Thông tin chỉ để tham khảo, không thay thế bác sĩ hoặc chuyên gia dinh dưỡng. Ứng dụng không chẩn đoán, kê đơn hoặc khuyên tự ý ngừng thuốc. Chỉ số dinh dưỡng có thể là ước lượng.”

- Khi người dùng mô tả dấu hiệu nguy hiểm như đau ngực, khó thở, ngất trong lúc tập, hiển thị khuyến cáo dừng tập và liên hệ cơ sở y tế/cấp cứu; không tiếp tục đưa kế hoạch tập luyện tự động cho tình huống đó. Quy tắc đơn giản trong demo không được giới thiệu là hệ thống sàng lọc y khoa hoàn chỉnh.
- Khi được hỏi về bệnh, thuốc hoặc chế độ điều trị, giải thích giới hạn và đề nghị hỏi chuyên gia; không bịa câu trả lời ngoài phạm vi.
- Tên, số điện thoại, địa chỉ, hồ sơ bệnh và đơn thuốc không thuộc dữ liệu cần thu thập của MVP.
- Có nút **“Xóa dữ liệu phiên”** để xóa hồ sơ, kế hoạch, nhật ký và ảnh xem trước.
- Thông báo “Dữ liệu chỉ giữ trong phiên; tải lại trang sẽ mất dữ liệu”. Nếu sau này gửi API, phân biệt rõ dữ liệu được truyền đi và không hứa nhà cung cấp không lưu khi chưa biết chính sách.

## 10. Tiến độ 120 phút

| Thời gian | Agent 1 | Agent 2 |
|---|---|---|
| 0–10 phút | Khởi tạo, chốt kiểu/thuộc tính, khung ứng dụng | Chốt dịch vụ, xác nhận khả năng API, chọn dữ liệu có nguồn |
| 10–35 phút | Hồ sơ và lịch tập | Dữ liệu, cách tính, dịch vụ demo và kế hoạch mẫu |
| 35–65 phút | Màn kế hoạch, chỉ số, nguồn | Màn bữa ăn, ảnh, mô tả, sửa khẩu phần |
| 65–90 phút | Nối trạng thái và nhật ký | Hoàn thiện đối chiếu; nối API nếu điều kiện truy cập đã sẵn sàng |
| 90–110 phút | Kiểm tra trên điện thoại, sửa lỗi tích hợp | Kiểm tra dữ liệu thiếu/lỗi dịch vụ, an toàn và nguồn |
| 110–120 phút | README, build và kịch bản demo chung | Rà soát nhãn mô phỏng, dữ liệu mẫu và giới hạn |

10 phút bổ sung dùng để kiểm tra gói nộp và nộp bài. Nếu chậm, bỏ hiệu ứng trang trí và API ảnh chưa sẵn sàng; giữ luồng văn bản, sửa khẩu phần, nguồn, nhật ký và nhãn giới hạn.

## 11. Tiêu chí nghiệm thu và kịch bản demo

Không cần viết một bộ kiểm thử lớn. Chạy build và kiểm tra thủ công các luồng có rủi ro sai kết quả:

- [ ] `npm install`, `npm run dev`, `npm run build` hoạt động theo README.
- [ ] Màn điện thoại không cuộn ngang, nút dưới cùng không che nội dung và bàn phím không chặn thao tác chính.
- [ ] Hồ sơ hợp lệ tạo được 7 ngày kế hoạch; số không hợp lệ bị chặn; người dưới 18 tuổi không nhận kế hoạch tự động.
- [ ] Có thể bỏ qua ảnh cơ thể; ảnh chọn/thay/xóa được; ảnh không quyết định chỉ số cơ thể.
- [ ] Nhập văn bản không có ảnh vẫn xem được kết quả hoặc câu hỏi bổ sung.
- [ ] Chụp/chọn ảnh được; ảnh lạ hoặc không đọc được không nhận một kết quả bịa.
- [ ] Sửa lượng ăn cập nhật chỉ số; thành phần chưa rõ hiện rõ, không bị tính bằng 0.
- [ ] Xem trước không cộng nhật ký; ghi nhận một lần cộng một lần; xóa bữa trừ đúng; ngày khác không bị cộng lẫn.
- [ ] Nguồn/giả định/nhãn mô phỏng xuất hiện cạnh kết quả; không có khóa bí mật trong mã frontend.
- [ ] Lỗi dịch vụ giữ đầu vào; không âm thầm đổi kết quả thật thành dữ liệu mẫu.
- [ ] Có disclaimer, xử lý yêu cầu vượt khả năng, cảnh báo dấu hiệu nguy hiểm và nút xóa phiên.

Demo trong khoảng 3 phút:

1. Nhập một hồ sơ người trưởng thành và lịch tập trong tuần; tạo kế hoạch, chọn ngày tập và mở nguồn/cách tính.
2. Chọn bữa mẫu có món Việt, xác nhận thành phần, sửa lượng ăn và cho thấy kết quả cập nhật. Nói rõ đang dùng AI thật, dữ liệu cục bộ hay mô phỏng.
3. Ghi nhận bữa, quay lại kế hoạch để xem tiến độ đúng ngày và gợi ý bổ sung/điều chỉnh.
4. Thử một trường hợp thiếu thông tin để thể hiện ứng dụng hỏi thêm và không bịa số liệu.

**Điều kiện hoàn thành:** hai luồng chính chạy xuyên suốt, kết quả có nguồn hoặc nhãn chưa kiểm chứng, giới hạn AI minh bạch và giao diện tiếng Việt dùng tốt trên điện thoại.
