# مكتبة المناهج

هذا المجلد هو المكان الرئيسي لإدارة الكتب والأدلة التي يعتمد عليها التحضير الذكي.

## طريقة التنظيم

ضع الملفات داخل `files` واكتب بياناتها في `catalog.json`.

مثال:

```text
curriculum-library/
  catalog.json
  files/
    1447/
      general/
        teacher-guides/
          teacher-guidance.pdf
      primary/
        grade-5/
          term-2/
            arabic/
              student-book.pdf
              teacher-guide.pdf
```

## تحديث كتاب

1. استبدل ملف PDF القديم بالنسخة الجديدة داخل `files`.
2. عدّل `version` أو `updated_at` في `catalog.json`.
3. شغّل:

```powershell
npm run curriculum:sync
```

سيتم رفع الملف إلى bucket خاص باسم `curriculum-books` وتحديث جدول `curriculum_documents`.

## ملاحظات

- لا يتم رفع ملفات الكتب إلى GitHub لأنها قد تكون كبيرة أو خاضعة لحقوق نشر.
- لا تحذف السجل من `catalog.json` عند تحديث الكتاب؛ استبدل مساره أو نسخته حتى تبقى المزامنة واضحة.
- يمكن إضافة كتب الطلاب، أدلة المعلمين، الأدلة الإرشادية، التوزيعات، والحلول.

