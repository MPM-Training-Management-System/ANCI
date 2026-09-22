using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QRCoder;
using server.Services.Interfaces;

namespace server.Services;

public class CertificatePdfService : ICertificatePdfService
{
    public async Task<Stream> GenerateAsync(
        string participantName,
        string trainingName,
        string batchCode,
        string certificateNumber,
        DateTime issuedAt,
        string verificationCode,
        string certificateType)
    {
        var stream = new MemoryStream();

        var verificationUrl =
            $"http://localhost:5296/api/certificate/verify/{verificationCode}";

        var qrGenerator = new QRCodeGenerator();

        using var qrData =
            qrGenerator.CreateQrCode(
                verificationUrl,
                QRCodeGenerator.ECCLevel.Q
            );

        var qrCode =
            new PngByteQRCode(qrData);

        var qrBytes =
            qrCode.GetGraphic(8);

        var title =
            certificateType.Equals(
                "Completion",
                StringComparison.OrdinalIgnoreCase)
                ? "CERTIFICATE OF COMPLETION"
                : "CERTIFICATE OF PARTICIPATION";

        var description =
            certificateType.Equals(
                "Completion",
                StringComparison.OrdinalIgnoreCase)
                ? "for successfully completing the"
                : "for successfully participating in the";

        Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());

                page.Margin(35);

                page.PageColor(Colors.White);

                page.DefaultTextStyle(
                    style => style.FontFamily("Lato")
                );

                page.Content()
                    .Border(3)
                    .BorderColor("#0038A8")
                    .Padding(25)
                    .Column(column =>
                    {
                        column.Spacing(8);

                        // ==========================================
                        // HEADER
                        // ==========================================

                        column.Item()
                            .AlignCenter()
                            .Text("ACE NEXTGEN")
                            .FontSize(28)
                            .Bold()
                            .FontColor("#0038A8");

                        column.Item()
                            .AlignCenter()
                            .Text("CONSULTANCY INC.")
                            .FontSize(13)
                            .SemiBold()
                            .FontColor("#CE1126");

                        column.Item()
                            .PaddingTop(8)
                            .AlignCenter()
                            .Text(title)
                            .FontSize(25)
                            .Bold()
                            .FontColor("#0038A8");

                        // ==========================================
                        // DESCRIPTION
                        // ==========================================

                        column.Item()
                            .PaddingTop(10)
                            .AlignCenter()
                            .Text(description)
                            .FontSize(13)
                            .FontColor("#444444");

                        // ==========================================
                        // PARTICIPANT
                        // ==========================================

                        column.Item()
                            .PaddingTop(5)
                            .AlignCenter()
                            .Text(participantName)
                            .FontSize(27)
                            .Bold()
                            .FontColor("#111111");

                        column.Item()
                            .AlignCenter()
                            .PaddingTop(2)
                            .Width(420)
                            .LineHorizontal(1)
                            .LineColor("#0038A8");

                        // ==========================================
                        // TRAINING
                        // ==========================================

                        column.Item()
                            .PaddingTop(8)
                            .AlignCenter()
                            .Text(trainingName)
                            .FontSize(18)
                            .Bold()
                            .FontColor("#0038A8");

                        column.Item()
                            .AlignCenter()
                            .Text($"Batch: {batchCode}")
                            .FontSize(11)
                            .FontColor("#555555");

                        // ==========================================
                        // FOOTER INFORMATION
                        // ==========================================

                        column.Item()
                            .PaddingTop(12)
                            .Row(row =>
                            {
                                row.RelativeItem()
                                    .AlignLeft()
                                    .Column(left =>
                                    {
                                        left.Item()
                                            .Text("Certificate No.")
                                            .FontSize(9)
                                            .SemiBold()
                                            .FontColor("#666666");

                                        left.Item()
                                            .Text(certificateNumber)
                                            .FontSize(10)
                                            .Bold();

                                        left.Item()
                                            .PaddingTop(5)
                                            .Text("Issued Date")
                                            .FontSize(9)
                                            .SemiBold()
                                            .FontColor("#666666");

                                        left.Item()
                                            .Text(
                                                issuedAt.ToLocalTime()
                                                    .ToString("MMMM dd, yyyy")
                                            )
                                            .FontSize(10)
                                            .Bold();
                                    });

                                row.ConstantItem(90)
                                    .AlignRight()
                                    .Column(right =>
                                    {
                                        right.Item()
                                            .AlignCenter()
                                            .Width(70)
                                            .Height(70)
                                            .Image(qrBytes);

                                        right.Item()
                                            .PaddingTop(2)
                                            .AlignCenter()
                                            .Text("Scan to verify")
                                            .FontSize(7)
                                            .FontColor("#666666");
                                    });
                            });

                        // ==========================================
                        // VERIFICATION CODE
                        // ==========================================

                        column.Item()
                            .PaddingTop(3)
                            .AlignCenter()
                            .Text($"Verification Code: {verificationCode}")
                            .FontSize(8)
                            .FontColor("#777777");
                    });
            });
        })
        .GeneratePdf(stream);

        stream.Position = 0;

        await Task.CompletedTask;

        return stream;
    }
}