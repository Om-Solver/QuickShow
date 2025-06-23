import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js"
import stripe from "stripe"

// Function to check availability of selected seats for a movie
const checkSeatAvailability = async (showId, selectedSeats) => {
    try {
        const ShowData = await Show.findById(showId)
        if (!ShowData) return false;

        const occupiedSeats = ShowData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        console.error(error.message)
        return false;
    }
}

export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;

        // check if the seat is available for the selected show
        const isAvailable = await checkSeatAvailability(showId, selectedSeats)

        if (!isAvailable) {
            return res.json({ success: false, message: "Selected Seats are not available." })
        }

        // Get the show details
        const ShowData = await Show.findById(showId).populate('movie');

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: ShowData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        })

        selectedSeats.map((seat) => {
            ShowData.occupiedSeats[seat] = userId;
        })

        ShowData.markModified('occupiedSeats');

        await ShowData.save();

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: ShowData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
        })

        booking.paymentLink = session.url
        await booking.save()

        // Run inngest sheduler Function to check payment status after 10 minutes
        await inngest.send({
            name: "app/checkpayment",
            data: {
                bookingId: booking._id.toString()
            }
        })

        res.json({ success: true, url: session.url })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

export const getOccupiedSeats = async (req, res) => {
    try {

        const { showId } = req.params;
        const ShowData = await Show.findById(showId)

        const occupiedSeats = Object.keys(ShowData.occupiedSeats)

        res.json({ success: true, occupiedSeats })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}