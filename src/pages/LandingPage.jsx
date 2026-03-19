import Hero from '../components/Hero';
import Teachers from '../components/Teachers';
import Classes from '../components/Classes';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <>
            <main>
                <section id="home">
                    <Hero />
                </section>
                <section id="teachers">
                    <Teachers />
                </section>
                <section id="classes">
                    <Classes />
                </section>
            </main>
            <section id="contact">
                <Footer />
            </section>
        </>
    );
};

export default LandingPage;
