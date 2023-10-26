<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مكتب المحاماة</title>
    <style>
        /* هنا يمكنك إضافة الأنماط الخاصة بك */
    </style>
</head>
<body>

    <!-- الشريط العلوي -->
    <header>
        <nav>
            <ul>
                <li><a href="#home">الرئيسية</a></li>
                <li><a href="#about">من نحن</a></li>
                <li><a href="#services">الخدمات</a></li>
                <li><a href="#contact">اتصل بنا</a></li>
            </ul>
        </nav>
    </header>

    <!-- القسم الرئيسي -->
    <section id="home">
        <h1>مرحباً في مكتب المحاماة</h1>
        <p>وصف موجز عن المكتب.</p>
    </section>

    <!-- قسم من نحن -->
    <section id="about">
        <h2>من نحن</h2>
        <p>نبذة مختصرة عن مكتب المحاماة.</p>
    </section>

    <!-- قسم الخدمات -->
    <section id="services">
        <h2>خدماتنا</h2>
        <!-- يمكنك إضافة المزيد من الخدمات هنا -->
        <article>
            <h3>خدمة 1</h3>
            <p>وصف الخدمة.</p>
        </article>
        <article>
            <h3>خدمة 2</h3>
            <p>وصف الخدمة.</p>
        </article>
    </section>

    <!-- قسم اتصل بنا -->
    <section id="contact">
        <h2>اتصل بنا</h2>
        <form action="path_to_backend_script" method="post">
            <label for="name">الاسم:</label>
            <input type="text" id="name" name="name" required>
            <label for="email">البريد الإلكتروني:</label>
            <input type="email" id="email" name="email" required>
            <label for="message">رسالتك:</label>
            <textarea id="message" name="message" required></textarea>
            <button type="submit">إرسال</button>
        </form>
    </section>

    <!-- الذيل -->
    <footer>
        <p>حقوق النشر © 2023. جميع الحقوق محفوظة.</p>
    </footer>

</body>
</html>
