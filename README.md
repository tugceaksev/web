# Görev Yönetim Sistemi

Modern ve kullanıcı dostu bir görev yönetim uygulaması. İnternet Programcılığı II dersi için geliştirilmiştir.

## Özellikler

- 👥 Kullanıcı yönetimi (kayıt, giriş, yetkilendirme)
- ✅ Görev oluşturma ve yönetimi
- 💬 Kullanıcılar arası mesajlaşma
- 👑 Admin paneli
- 📱 Responsive tasarım

## Teknolojiler

- [Next.js 14](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Stil kütüphanesi
- [Prisma](https://www.prisma.io/) - ORM
- [NextAuth.js](https://next-auth.js.org/) - Kimlik doğrulama
- [SQLite](https://www.sqlite.org/) - Veritabanı

## Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone [repo-url]
   cd [proje-klasörü]
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env.local` dosyasını oluşturun:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Veritabanını oluşturun:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

   Sunucu artık otomatik olarak tüm yerel ağda paylaşılır. Kendi bilgisayarınızın IP adresini öğrenip, ağdaki diğer cihazlardan şu şekilde erişebilirsiniz:
   
   ```
   http://<bilgisayar-ip-adresi>:3000
   ```
   
   Örneğin: `http://192.168.1.137:3000`

6. Tarayıcınızda [http://localhost:3000](http://localhost:3000) veya yukarıdaki IP adresiyle uygulamayı açın.

## Kullanım

### Kullanıcı Hesabı
- `/login` - Giriş yapma
- `/register` - Yeni hesap oluşturma

### Görevler
- `/tasks` - Görev listesi
- `/tasks/new` - Yeni görev oluşturma
- `/tasks/[id]` - Görev detayları

### Mesajlaşma
- `/messages` - Mesaj kutusu
- `/messages/[userId]` - Kullanıcı ile mesajlaşma

### Admin Paneli
- `/admin` - Yönetici kontrol paneli
- `/admin/users` - Kullanıcı yönetimi
- `/admin/tasks` - Tüm görevlerin yönetimi

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.
