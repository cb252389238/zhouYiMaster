import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;

public class generate_icons {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            throw new IllegalArgumentException("Usage: java generate_icons <source> <projectRoot>");
        }

        File sourceFile = new File(args[0]);
        File projectRoot = new File(args[1]);
        BufferedImage source = ImageIO.read(sourceFile);

        if (source == null) {
            throw new IOException("无法读取图标源文件: " + sourceFile);
        }

        writeLauncherSet(source, new File(projectRoot, "android/app/src/main/res/mipmap-mdpi"), 48);
        writeLauncherSet(source, new File(projectRoot, "android/app/src/main/res/mipmap-hdpi"), 72);
        writeLauncherSet(source, new File(projectRoot, "android/app/src/main/res/mipmap-xhdpi"), 96);
        writeLauncherSet(source, new File(projectRoot, "android/app/src/main/res/mipmap-xxhdpi"), 144);
        writeLauncherSet(source, new File(projectRoot, "android/app/src/main/res/mipmap-xxxhdpi"), 192);
    }

    private static void writeLauncherSet(BufferedImage source, File outputDir, int size) throws IOException {
        if (!outputDir.exists() && !outputDir.mkdirs()) {
            throw new IOException("无法创建目录: " + outputDir);
        }

        BufferedImage square = renderCover(source, size, false);
        ImageIO.write(square, "png", new File(outputDir, "ic_launcher.png"));
        ImageIO.write(square, "png", new File(outputDir, "ic_launcher_foreground.png"));

        BufferedImage round = renderCover(source, size, true);
        ImageIO.write(round, "png", new File(outputDir, "ic_launcher_round.png"));
    }

    private static BufferedImage renderCover(BufferedImage source, int size, boolean round) {
        BufferedImage canvas = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = canvas.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, size, size);

        if (round) {
            g.setClip(new Ellipse2D.Float(0, 0, size, size));
        }

        int srcW = source.getWidth();
        int srcH = source.getHeight();
        double scale = Math.max((double) size / srcW, (double) size / srcH);
        int drawW = (int) Math.round(srcW * scale);
        int drawH = (int) Math.round(srcH * scale);
        int x = (size - drawW) / 2;
        int y = (size - drawH) / 2;

        g.setComposite(AlphaComposite.SrcOver);
        g.drawImage(source, x, y, drawW, drawH, null);
        g.dispose();
        return canvas;
    }
}
